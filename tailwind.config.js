/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["authorization_code/public/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'custom-color': '#FF00FF',
      },
      backgroundImage: {
        'spotify-fondo': "url('spotify-icons-logos/fondo.jpg')",
      },
    },
  },
  plugins: [],
}

