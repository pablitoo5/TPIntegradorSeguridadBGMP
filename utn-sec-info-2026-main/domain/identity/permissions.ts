import { ROLES } from './roles'

export enum PERMISSION {
    // Permisos de navegación y uso
    HOME_CHAT = 'home.chat',
    STUDENTS_LIST = 'students.list',

    // Permisos específicos de acción
    CLEAR_CHAT = 'chat.clear',        // Solo para docentes/admin
    VIEW_PRIVATE_INFO = 'info.private' // Lo que habías puesto de "Información Privada"
}

export const PERMISSIONS_BY_ROLE: Record<string, PERMISSION[]> = {
    [ROLES.Admin]: [
        PERMISSION.HOME_CHAT,
        PERMISSION.STUDENTS_LIST,
        PERMISSION.CLEAR_CHAT,
        PERMISSION.VIEW_PRIVATE_INFO
    ],
    [ROLES.Docente]: [
        PERMISSION.HOME_CHAT,
        PERMISSION.STUDENTS_LIST,
        PERMISSION.CLEAR_CHAT,
        PERMISSION.VIEW_PRIVATE_INFO
    ],
    [ROLES.Estudiante]: [
        PERMISSION.HOME_CHAT,
        PERMISSION.STUDENTS_LIST
    ]
};
