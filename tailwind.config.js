/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#73cf17", // Florizza brand color
                "background-light": "#F9F8F6",
                "background-dark": "#121212",
                "plaster": "#F2F0ED",
            },
            fontFamily: {
                display: ["'Playfair Display'", "serif"],
                sans: ["Manrope", "sans-serif"],
            },
            borderRadius: {
                'DEFAULT': '0.375rem',
                'md': '0.375rem',
                'arch': '50% 50% 0 0',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries')
    ],
}
