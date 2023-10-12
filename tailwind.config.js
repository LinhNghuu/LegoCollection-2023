/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
    daisyui: {
      themes: ["light", "dark", "valentine"],
  },
  plugins: [],
  purge: ['./**/*.html'],
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
}

