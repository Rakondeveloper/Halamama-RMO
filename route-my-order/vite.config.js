import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/demo/order-management/route-my-order/",
  plugins: [react()],
  server: {
    port: 5174,
    open: true
  }
})
