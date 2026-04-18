"use client";

import { useConversation } from '@/app/hooks/useConversation'
import { useState, useRef, useEffect, FormEvent } from "react"
import { useConversationStore, UserRole, Message } from '@/app/store/conversation'
import { SignInButton, Show, useUser } from '@clerk/nextjs'

export default function Home() {
  const { conversation, clearConversation } = useConversationStore() as any
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Obtenemos y normalizamos el rol 
  const { user, isLoaded } = useUser()
  const rawRole = user?.publicMetadata?.role as string | undefined
  const normalizedRole = rawRole ? rawRole.toLowerCase().trim() : "sin rol"
  
  const isEstudiante = normalizedRole === "estudiante"
  // Nueva variable para saber si el usuario tiene algún rol asignado
  const hasRole = normalizedRole !== "sin rol"

  // Estado del límite de mensajes
  const [dailyMessageCount, setDailyMessageCount] = useState(0)
  const MAX_MESSAGES = 10

  // Añade esto en cualquier parte de tu código para forzar un error
function testSecurity() {
  // Vulnerabilidad: Contraseña en texto plano
  const dbPassword = "super_secret_password_123"; 
  
  // Code Smell: Variable declarada pero nunca usada
  const unusedVariable = "hola mundo";
  
  console.log("Probando pipeline con clave:", dbPassword);
}

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

  // Calcula el límite
  const isLimitReached = isEstudiante && dailyMessageCount >= MAX_MESSAGES
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, isLoading])

  const { addMessageConversation } = useConversation()

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
      console.error("Error al obtener la respuesta de la IA:", error)
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <>
      {/* Vista sin sesión  */}
      <Show when="signed-out">
        <main className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
          <div className="max-w-md text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white dark:text-zinc-900">
                  <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c1.68 0 3.282.466 4.75 1.315a.75.75 0 001-.707V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                SecureCampus IA
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                Tu asistente académico y directorio de estudiantes en un entorno seguro y blindado.
              </p>
            </div>

            <SignInButton mode="modal">
              <button className="px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md hover:shadow-lg active:scale-95">
                Iniciar Sesión / Registrarse
              </button>
            </SignInButton>
          </div>
        </main>
      </Show>

      {/*  Vista con sesión iniciada */}
      <Show when="signed-in">
        <main className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-zinc-950 h-full w-full overflow-hidden relative">
          
          {/* Debug Badge (puedes borrarlo luego) */}
          {isLoaded && (
            <div className="absolute top-2 left-2 bg-red-100 border border-red-400 text-red-800 px-3 py-1 rounded-md text-xs font-mono z-50 shadow-sm pointer-events-none">
              Rol detectado: [{normalizedRole}]
              {isEstudiante && ` | Límite: ${dailyMessageCount}/${MAX_MESSAGES}`}
            </div>
          )}

          {/* Evaluación de acceso */}
          {!hasRole ? (
            
            /* Pantalla sin rol */
            <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center">
              <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500 dark:text-zinc-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Acceso Restringido</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                Tu cuenta ha sido verificada, pero aún no tienes un rol asignado. Por favor, comunícate con un administrador para que habilite tu acceso al sistema.
              </p>
            </div>

          ) : (

            /* Pantalla del chat principal */
            <div className="flex flex-col w-full max-w-3xl flex-1 bg-white dark:bg-zinc-900/50 shadow-sm border-x border-zinc-200 dark:border-zinc-800 overflow-hidden relative mt-10 sm:mt-0">
              {conversation.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 shrink-0">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {conversation.length} {conversation.length === 1 ? 'mensaje' : 'mensajes'}
                  </span>
                  
                  {/* Botón limpiar chat oculto para estudiantes */}
                  {!isEstudiante && (
                    <button
                      onClick={() => clearConversation?.()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Limpiar chat
                    </button>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {conversation.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm text-center">
                    Inicia la conversación enviando un mensaje.
                  </div>
                ) : (
                  conversation.map((msg: Message) => (
                    <div key={msg.id} className={`flex w-full ${msg.role === UserRole.Teacher ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === UserRole.Teacher ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-br-sm" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-bl-sm"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex w-full justify-start">
                    <div className="max-w-[85%] px-4 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 rounded-bl-sm flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 shrink-0 z-20">
                {isLimitReached && (
                  <div className="text-xs text-red-500 font-medium text-center pb-1">
                    Has alcanzado el límite diario de {MAX_MESSAGES} mensajes. Vuelve mañana.
                  </div>
                )}
                
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isLimitReached ? "Límite diario alcanzado" : "Escribe un mensaje..."}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || isLimitReached}
                    suppressHydrationWarning
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading || isLimitReached}
                    className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center aspect-square"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -ml-0.5">
                      <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </Show>
    </>
  )
}