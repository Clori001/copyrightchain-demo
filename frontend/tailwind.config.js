/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          500: "#1f6fff",
          600: "#1258eb",
          700: "#0f47bf"
        },
        ink: {
          900: "#0b1833",
          700: "#243656",
          500: "#61708f"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(17, 52, 105, 0.08)"
      }
    }
  },
  plugins: []
};

