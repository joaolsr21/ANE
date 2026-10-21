/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial "A Noite Eterna"
        'bg-main': '#0D0D12',       // Escuridão Profunda (Background principal)
        'bg-card': '#1A1A24',       // Asfalto Úmido (Cartões, barras laterais, modais)
        'primary-blood': '#8B1E1E', // Sangue Seco (Acentos primários, perigo, infecção)
        'secondary-uv': '#5D3FD3',  // Luz Ultravioleta (Zona segura, rolar dados)
        'text-main': '#E2E8F0',     // Concreto (Texto principal, ícones)
        'warning-rust': '#B45309',  // Ferrugem (Sanidade, Fome/Sede, alertas moderados)
        'muted-ash': '#9CA3AF',     // Cinza Desgastado (Texto secundário, bordas, placeholders)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'blood-glow': '0 0 20px -5px rgba(139, 30, 30, 0.5)',
        'uv-glow': '0 0 20px -5px rgba(93, 63, 211, 0.5)',
      }
    },
  },
  plugins: [],
}
