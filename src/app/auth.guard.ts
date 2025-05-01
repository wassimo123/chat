import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      return true;
    }

    this.router.navigate(['/connexion'], { queryParams: { error: 'unauthorized' } });
    return false;
  }
}