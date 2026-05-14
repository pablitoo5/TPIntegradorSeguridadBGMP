import { useSessionStore } from '@/app/store/session'
import { PERMISSION, PERMISSIONS_BY_ROLE } from '@/domain/identity/permissions'

export const usePermission = () => {
    const { user } = useSessionStore()

    const hasPermission = (permission: PERMISSION): boolean => {
        if (!user?.role) return false;

        // Búsqueda instantánea O(1) usando la clave del diccionario de los roles con sus permisos
        const userPermissions = PERMISSIONS_BY_ROLE[user.role] || [];
        return userPermissions.includes(permission);
    }

    return { hasPermission }
}

