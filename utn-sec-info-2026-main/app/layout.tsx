import { ClerkProvider, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">

          {/* BARRA DE NAVEGACIÓN RECUPERADA */}
          <header className="flex items-center justify-between px-6 py-4 bg-zinc-950 text-white border-b border-zinc-800 shrink-0">
            {/* Logo y Links */}
            <div className="flex items-center gap-6">
              <h1 className="font-bold text-lg tracking-wider">SECURE CAMPUS IA</h1>
              <nav className="flex gap-4">
                <Link href="/" className="px-3 py-1 bg-zinc-800 rounded-md text-sm">Chat</Link>
                <Link href="/students" className="px-3 py-1 text-zinc-400 hover:text-white text-sm">Estudiantes</Link>
              </nav>
            </div>

            {/* El botón de usuario de Clerk, alineado a la derecha */}
            <div>
              <UserButton />
            </div>
          </header>

          {/* CONTENIDO DE LA PÁGINA (Acá se carga el page.tsx) */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>

        </body>
      </html>
    </ClerkProvider>
  )
}