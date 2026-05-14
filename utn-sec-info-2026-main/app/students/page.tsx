"use client"

import { useEffect, useState } from "react"
import { useStudents } from "@/app/hooks/useStudents"
import { useStudentsStore, Student } from "@/app/store/students"
import { useSessionStore } from "@/app/store/session" // Usamos el store sincronizado
import { Guard } from "@/app/components/Guard"
import { PERMISSION } from "@/domain/identity/permissions"
import { Unauthorized } from '@/app/components/Unauthorized'

export default function StudentsPage() {
  const { user } = useSessionStore() // Leemos del store que actualizó el Header
  const { fetchStudents } = useStudents()
  const { students } = useStudentsStore()
  const [isLoading, setIsLoading] = useState(true)

  // Lógica de roles derivada del Store
  const hasRole = !!user?.role && user.role.trim() !== ""
  const isStudent = user?.role?.toLowerCase() === "estudiante"

  useEffect(() => {
    if (!hasRole) {
      setIsLoading(false)
      return
    }

    const loadStudents = async () => {
      try {
        await fetchStudents()
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStudents()
  }, [hasRole, fetchStudents])

  // Si no tiene rol, muestra la pantalla de acceso restringido
  if (!hasRole && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center">
        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Acceso Restringido</h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
          Tu cuenta no tiene un rol asignado. Contacta al administrador.
        </p>
      </div>
    )
  }

  // Si tiene rol usamos el Guard para verificar el permiso específico
  return (
    <Guard permission={PERMISSION.STUDENTS_LIST} fallback={<Unauthorized />}>
      <main className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950 h-full w-full overflow-hidden">
        <div className="flex flex-col w-full max-w-4xl flex-1 bg-white dark:bg-zinc-900/50 shadow-sm border-x border-zinc-200 dark:border-zinc-800 overflow-hidden">

          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Listado de Estudiantes</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-zinc-500">
                <span className="animate-spin mr-3">🌀</span> Cargando...
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-500">
                No se encontraron estudiantes.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {students.map((student: Student) => (
                  <li key={student.id} className="p-4 sm:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-medium">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{student.name}</p>
                        <p className="text-sm text-zinc-500">{student.email || `ID: ${student.id}`}</p>

                        {/* Información extra solo si no es estudiante */}
                        {!isStudent && (
                          <div className="mt-2 py-1 px-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                            <p className="text-[10px] uppercase font-bold text-blue-600">Info Administrativa</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">Datos visibles solo para docentes/admin.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </Guard>
  )
}