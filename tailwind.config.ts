// tailwind.config.js
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
                primary: "#059669",  // Vert émeraude principal
                "primary-light": "#10b981",
                "primary-dark": "#047857",
            },
        },
    },
    plugins: [],
    // S'assurer que Tailwind prend le dessus sur les styles d'Ant Design si nécessaire
    important: true,
};