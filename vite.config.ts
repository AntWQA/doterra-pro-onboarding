import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Vite does NOT read PORT on its own — left alone it always tries 5173
    // and, if that is taken, quietly moves to the next free port. That silent
    // drift is the real problem: the launcher would poll the port it assigned
    // while the server listened somewhere else.
    //
    // So honour PORT when the launcher sets one, with strictPort so a clash
    // fails loudly rather than drifting. With no PORT (a plain `npm run dev`)
    // behaviour is unchanged: 5173, free to move if busy.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    strictPort: Boolean(process.env.PORT),
  },
})
