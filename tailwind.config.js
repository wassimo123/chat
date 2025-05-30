/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Angular templates et TS
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#6B7280",
        cafe: {
          light: "#d5b185",
          dark: "#6d4c41"
        },
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
        button: "8px",
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'bounce-arrow1': 'bounceArrow 2s infinite',
        'bounce-arrow2': 'bounceArrow 2s infinite 0.2s',
        'bounce-arrow3': 'bounceArrow 2s infinite 0.4s',
      },
    },
  },
  plugins: [],
};



// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{html,ts}", // Ajoute les fichiers Angular
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: "#4F46E5",
//         secondary: "#6B7280",
//       },
//       borderRadius: {
//         none: "0px",
//         sm: "4px",
//         DEFAULT: "8px",
//         md: "12px",
//         lg: "16px",
//         xl: "20px",
//         "2xl": "24px",
//         "3xl": "32px",
//         full: "9999px",
//         button: "8px",
//       },
//     },
//   },
//   plugins: [],
// };
// module.exports = {
//   content: [
//     "./src/**/*.{html,ts}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: "#4F46E5",
//         secondary: "#6B7280",
//         cafe: {
//           light: "#d5b185", // fond
//           dark: "#6d4c41"   // texte
//         },
        
//       },
//       borderRadius: {
//         none: "0px",
//         sm: "4px",
//         DEFAULT: "8px",
//         md: "12px",
//         lg: "16px",
//         xl: "20px",
//         "2xl": "24px",
//         "3xl": "32px",
//         full: "9999px",
//         button: "8px",
//       },
//       fontFamily: {
//         poppins: ['Poppins', 'sans-serif'],}
//     },
//   },
//   plugins: [],
// }
