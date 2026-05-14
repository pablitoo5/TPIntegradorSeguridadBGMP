"use client";

import { useState, useRef, useEffect, FormEvent } from "react"
import { Guard } from "@/app/components/Guard"
import { PERMISSION } from "@/domain/identity/permissions"
import { Unauthorized } from '@/app/components/Unauthorized'
import { useConversation } from '@/app/hooks/useConversation'
import { useConversationStore, UserRole, Message } from '@/app/store/conversation'
import { useSessionStore } from "@/app/store/session"
import { SignInButton, useUser } from '@clerk/nextjs'

export default function Home() {
  // Estados y Stores
  const { conversation, clearConversation } = useConversationStore() as any
  const { user } = useSessionStore()
  const { isLoaded: sessionLoaded, isSignedIn } = useUser()
  const { addMessageConversation } = useConversation()

  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dailyMessageCount, setDailyMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Lógica de Roles y Límites
  const MAX_MESSAGES = 10
  const normalizedRole = user?.role?.toLowerCase().trim() || "sin rol"
  const isEstudiante = normalizedRole === "estudiante"
  const hasRole = !!user?.role && user.role.trim() !== ""
  const isLimitReached = isEstudiante && dailyMessageCount >= MAX_MESSAGES

  // Persistencia del límite diario
  useEffect(() => {
    const today = new Date().toLocaleDateString()
    const storedData = localStorage.getItem('securecampus_limit')

    if (storedData) {
      const { count, date } = JSON.parse(storedData)
      if (date === today) {
        setDailyMessageCount(count)
      } else {
        localStorage.setItem('securecampus_limit', JSON.stringify({ count: 0, date: today }))
        setDailyMessageCount(0)
      }
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, isLoading])

  // Manejador de envío
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading || isLimitReached) return

    setIsLoading(true)
    try {
      await addMessageConversation(inputValue.trim())
      setInputValue("")

      if (isEstudiante) {
        const newCount = dailyMessageCount + 1
        setDailyMessageCount(newCount)
        localStorage.setItem('securecampus_limit', JSON.stringify({
          count: newCount,
          date: new Date().toLocaleDateString()
        }))
      }
    } catch (error) {
      console.error("Error Groq:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!sessionLoaded) {
    return null
  }

  if (!isSignedIn) {
    return (
      <main className="flex h-full w-full flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-md text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🤖</span>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">SecureCampus IA</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Tu asistente académico en un entorno seguro y blindado.</p>
          </div>
          <SignInButton mode="modal">
            <button className="px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-semibold hover:scale-105 transition-all">
              Comenzar ahora
            </button>
          </SignInButton>
        </div>
      </main>
    )
  }

  return (
    <>
      {!hasRole ? (
        /* Sub-vista: Sin Rol Asignado */
        <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center bg-zinc-50 dark:bg-zinc-950">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Acceso Restringido</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
            Cuenta verificada, pero sin rol. Contacta a un administrador para habilitar tu acceso.
          </p>
        </div>
      ) : (
        /* Sub-vista: Chat */
        <Guard permission={PERMISSION.HOME_CHAT} fallback={<Unauthorized />}>
          <main className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950 h-full w-full overflow-hidden">

            <div className="flex flex-col w-full max-w-3xl flex-1 bg-white dark:bg-zinc-900/50 shadow-sm border-x border-zinc-200 dark:border-zinc-800 overflow-hidden relative">

              {/* Indicador de límite de mensajes para estudiantes */}
              {isEstudiante && (
                <div className="absolute top-2 left-2 z-30 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-mono">
                  Mensajes: {dailyMessageCount}/{MAX_MESSAGES}
                </div>
              )}

              {/* Toolbar */}
              {conversation.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 shrink-0">
                  <span className="text-xs font-medium text-zinc-500">
                    {conversation.length} mensajes
                  </span>
                  {!isEstudiante && (
                    <button
                      onClick={() => clearConversation?.()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      Limpiar chat
                    </button>
                  )}
                </div>
              )}

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {conversation.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                    ¿En qué puedo ayudarte hoy?
                  </div>
                ) : (
                  conversation.map((msg: Message) => (
                    <div key={msg.id} className={`flex w-full ${msg.role === UserRole.Teacher ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === UserRole.Teacher
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-br-sm"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-bl-sm"
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex w-full justify-start">
                    <div className="px-4 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 shrink-0">
                {isLimitReached && (
                  <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">
                    Límite diario alcanzado. Vuelve mañana para más consultas.
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isLimitReached ? "Límite alcanzado..." : "Escribe tu consulta académica..."}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-zinc-500 outline-none disabled:opacity-50"
                    disabled={isLoading || isLimitReached}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading || isLimitReached}
                    className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:scale-105 disabled:opacity-50 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </main>
        </Guard>
      )}
    </>
  )
}