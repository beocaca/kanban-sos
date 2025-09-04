/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'elevation-surface': '#ffffff',
        'elevation-surface-hovered': '#f7f8f9',
        'elevation-surface-sunken': '#f1f2f4',
        'background-selected-hovered': '#e3f2fd',
        'text-subtlest': '#6b778c',
      },
      boxShadow: {
        'raised': '0 1px 3px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
      },
      spacing: {
        '100': '8px',
        '200': '16px',
      },
      borderRadius: {
        'large': '8px',
        'xlarge': '12px',
      }
    },
  },
  plugins: [],
}