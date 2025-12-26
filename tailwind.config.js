/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          amrita: {
            maroon: "#990000",   // Primary Brand Color
            gold: "#FFD700",     // Secondary Accent
            bg: "#FFF5F5",       // Light Background
            text: "#2D2D2D"      // Dark Text
          }
        }
      },
    },
    plugins: [],
  };
