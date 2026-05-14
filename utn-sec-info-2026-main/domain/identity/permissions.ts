import { ROLES } from './roles'

export enum PERMISSION {
    // Permisos de navegación y uso
    HOME_CHAT = 'home.chat',
    STUDENTS_LIST = 'students.list',

    // Permisos específicos de acción
    CLEAR_CHAT = 'chat.clear',        // Solo para docentes/admin
    VIEW_PRIVATE_INFO = 'info.private' // Lo que habías puesto de "Información Privada"
}

export const PERMISSIONS_BY_ROLE = [
    // --- ADMIN: Tiene control total ---
    { role: ROLES.Admin, permission: PERMISSION.HOME_CHAT },
    { role: ROLES.Admin, permission: PERMISSION.STUDENTS_LIST },
    { role: ROLES.Admin, permission: PERMISSION.CLEAR_CHAT },
    { role: ROLES.Admin, permission: PERMISSION.VIEW_PRIVATE_INFO },

    // --- DOCENTE: Puede ver alumnos y limpiar chat ---
    { role: ROLES.Docente, permission: PERMISSION.HOME_CHAT },
    { role: ROLES.Docente, permission: PERMISSION.STUDENTS_LIST },
    { role: ROLES.Docente, permission: PERMISSION.CLEAR_CHAT },
    { role: ROLES.Docente, permission: PERMISSION.VIEW_PRIVATE_INFO },

    // --- ESTUDIANTE: Solo puede usar el chat y ver el listado de alumnos ---
    { role: ROLES.Estudiante, permission: PERMISSION.HOME_CHAT },
    { role: ROLES.Estudiante, permission: PERMISSION.STUDENTS_LIST },
]