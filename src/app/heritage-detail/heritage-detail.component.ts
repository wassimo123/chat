import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeritageService, HeritageItem } from '../heritage.service';
import * as AOS from 'aos';
import * as echarts from 'echarts';
import { NavbarComponent } from '../component/navbar/navbar.component';
import { FooterComponent } from '../component/footer/footer.component';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-heritage-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent, NavbarComponent],
  templateUrl: './heritage-detail.component.html',
  styleUrls: ['./heritage-detail.component.css']
})
export class HeritageDetailComponent implements OnInit, AfterViewInit {
  heritageItem: HeritageItem | undefined;
  isModalOpen: boolean = false;
  currentImageIndex: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  paginatedGallery: { src: string; alt: string }[] = [];
  totalPages: number = 1;
  pageNumbers: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private heritageService: HeritageService,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      offset: 100,
      once: true,
      mirror: false
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.heritageItem = this.heritageService.getHeritageItem(id);
      if (this.heritageItem) {
        this.updatePagination();
      }
    }
  }

  ngAfterViewInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    if (this.heritageItem) {
      const chartDom = document.getElementById('visitorChart');
      if (chartDom) {
        const myChart = echarts.init(chartDom);
        const option = {
          animation: false,
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: '#f0f0f0',
            textStyle: { color: '#1f2937' }
          },
          legend: {
            data: ['Visiteurs locaux', 'Touristes internationaux'],
            textStyle: { color: '#1f2937' }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            axisLine: { lineStyle: { color: '#d1d5db' } },
            axisLabel: { color: '#1f2937' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#d1d5db' } },
            axisLabel: { color: '#1f2937' },
            splitLine: { lineStyle: { color: '#f3f4f6' } }
          },
          series: [
            {
              name: 'Visiteurs locaux',
              type: 'line',
              stack: 'Total',
              smooth: true,
              lineStyle: { width: 3, color: 'rgba(87, 181, 231, 1)' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(87, 181, 231, 0.3)' },
                  { offset: 1, color: 'rgba(87, 181, 231, 0.1)' }
                ])
              },
              emphasis: { focus: 'series' },
              data: [1200, 1320, 1500, 1800, 2100, 2400, 2700, 3000, 2800, 2500, 2200, 2000]
            },
            {
              name: 'Touristes internationaux',
              type: 'line',
              stack: 'Total',
              smooth: true,
              lineStyle: { width: 3, color: 'rgba(141, 211, 199, 1)' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(141, 211, 199, 0.3)' },
                  { offset: 1, color: 'rgba(141, 211, 199, 0.1)' }
                ])
              },
              emphasis: { focus: 'series' },
              data: [800, 950, 1100, 1500, 1800, 2200, 2500, 2800, 2300, 1900, 1600, 1400]
            }
          ]
        };
        myChart.setOption(option);
        window.addEventListener('resize', () => myChart.resize());
      }
    }
  }

  openModal(): void {
    this.isModalOpen = true;
    this.currentImageIndex = 0;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (this.heritageItem && this.currentImageIndex < this.heritageItem.gallery.length - 1) {
      this.currentImageIndex++;
    }
  }

  updatePagination(): void {
    if (this.heritageItem) {
      this.totalPages = Math.ceil(this.heritageItem.gallery.length / this.itemsPerPage);
      this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedGallery = this.heritageItem.gallery.slice(startIndex, endIndex);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }
}