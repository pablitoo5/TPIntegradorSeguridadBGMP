import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import SessionInitializer from "@/app/store/SessionInitializer";
import { UserSession } from "@/app/store/session";
import { Header } from "@/app/Header";
import "./globals.css";

// Configuración de fuentes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Campus IA",
  description: "Plataforma de gestión inteligente para el campus universitario",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtenemos el usuario desde el servidor (Seguridad máxima)
  const clerkUser = await currentUser();

  // Mapeamos la data de Clerk a la interfaz de sesión
  // IMPORTANTE: Acá extraemos el 'role' real de publicMetadata
  const userSession: UserSession | null = clerkUser ? {
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    imageUrl: clerkUser.imageUrl,
    role: clerkUser.publicMetadata?.role as string // en caso de querer que el usuario tenga un rol predeterminado al ser creado, agregamos || "rol"
  } : null;

  return (
    <ClerkProvider signInUrl="/" signUpUrl="/">
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-[100dvh] antialiased overflow-hidden`}
      >
        <body className="h-full flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">

          {/* Pasa el usuario del servidor al cliente (Zustand) */}
          <SessionInitializer user={userSession} />

          {/* Usamos el Header que armamos */}
          <Header />

          {/* El contenido principal */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}