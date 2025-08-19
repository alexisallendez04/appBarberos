const { query } = require('../config/db');

class UserService {
    static mainUserId = null;
    static mainUserData = null;
    static lastCheck = null;
    static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

    /**
     * Obtener el ID del usuario principal del sistema
     * @returns {Promise<number>} ID del usuario principal
     */
    static async getMainUserId() {
        // Verificar si tenemos el ID en caché y no ha expirado
        if (this.mainUserId && this.lastCheck && (Date.now() - this.lastCheck) < this.CACHE_DURATION) {
            return this.mainUserId;
        }

        try {
            // Buscar el usuario principal (el que tiene más servicios y horarios configurados)
            const sql = `
                SELECT 
                    u.id,
                    u.nombre,
                    u.apellido,
                    u.email,
                    u.nombre_barberia,
                    COUNT(DISTINCT s.id) as servicios_count,
                    COUNT(DISTINCT h.id) as horarios_count,
                    (COUNT(DISTINCT s.id) + COUNT(DISTINCT h.id)) as total_config
                FROM usuarios u
                LEFT JOIN servicios s ON u.id = s.id_usuario AND s.estado = 'activo'
                LEFT JOIN horarios_laborales h ON u.id = h.id_usuario AND h.estado = 'activo'
                WHERE (u.rol = 'barbero' OR u.rol = 'admin') AND u.estado = 'activo'
                GROUP BY u.id, u.nombre, u.apellido, u.email, u.nombre_barberia
                ORDER BY total_config DESC, servicios_count DESC, u.creado_en ASC
                LIMIT 1
            `;

            const users = await query(sql);

            if (users.length === 0) {
                // Si no hay usuarios con configuración, buscar el primer barbero o admin activo
                const fallbackSql = `
                    SELECT id, nombre, apellido, email, nombre_barberia
                    FROM usuarios 
                    WHERE (rol = 'barbero' OR rol = 'admin') AND estado = 'activo'
                    ORDER BY creado_en ASC
                    LIMIT 1
                `;
                
                const fallbackUsers = await query(fallbackSql);
                
                if (fallbackUsers.length === 0) {
                    throw new Error('No se encontró ningún barbero o administrador activo en el sistema');
                }

                const user = fallbackUsers[0];
                this.mainUserId = user.id;
                this.mainUserData = user;
                this.lastCheck = Date.now();
                
                console.log(`🎯 Usuario principal establecido (fallback): ID ${user.id} - ${user.nombre} ${user.apellido}`);
                return user.id;
            }

            const user = users[0];
            this.mainUserId = user.id;
            this.mainUserData = user;
            this.lastCheck = Date.now();

            console.log(`🎯 Usuario principal establecido: ID ${user.id} - ${user.nombre} ${user.apellido} (${user.servicios_count} servicios, ${user.horarios_count} horarios)`);
            return user.id;

        } catch (error) {
            console.error('Error al obtener usuario principal:', error);
            throw error;
        }
    }

    /**
     * Obtener datos completos del usuario principal
     * @returns {Promise<Object>} Datos del usuario principal
     */
    static async getMainUserData() {
        if (!this.mainUserData || !this.lastCheck || (Date.now() - this.lastCheck) >= this.CACHE_DURATION) {
            await this.getMainUserId(); // Esto actualizará mainUserData
        }
        return this.mainUserData;
    }

    /**
     * Limpiar caché del usuario principal (útil para testing o cuando se actualiza la configuración)
     */
    static clearCache() {
        this.mainUserId = null;
        this.mainUserData = null;
        this.lastCheck = null;
        console.log('🗑️ Caché del usuario principal limpiado');
    }

    /**
     * Verificar si un usuario es el principal
     * @param {number} userId - ID del usuario a verificar
     * @returns {Promise<boolean>} True si es el usuario principal
     */
    static async isMainUser(userId) {
        const mainUserId = await this.getMainUserId();
        return mainUserId === userId;
    }

    /**
     * Obtener información de todos los usuarios barberos y administradores
     * @returns {Promise<Array>} Lista de usuarios barberos y administradores
     */
    static async getAllBarbers() {
        try {
            const sql = `
                SELECT 
                    u.id,
                    u.nombre,
                    u.apellido,
                    u.email,
                    u.nombre_barberia,
                    u.estado,
                    u.rol,
                    COUNT(DISTINCT s.id) as servicios_count,
                    COUNT(DISTINCT h.id) as horarios_count
                FROM usuarios u
                LEFT JOIN servicios s ON u.id = s.id_usuario AND s.estado = 'activo'
                LEFT JOIN horarios_laborales h ON u.id = h.id_usuario AND h.estado = 'activo'
                WHERE u.rol = 'barbero' OR u.rol = 'admin'
                GROUP BY u.id, u.nombre, u.apellido, u.email, u.nombre_barberia, u.estado, u.rol
                ORDER BY u.creado_en ASC
            `;

            return await query(sql);
        } catch (error) {
            console.error('Error al obtener barberos y administradores:', error);
            throw error;
        }
    }

    /**
     * Cambiar el usuario principal del sistema
     * @param {number} newMainUserId - ID del nuevo usuario principal
     * @returns {Promise<boolean>} True si se cambió exitosamente
     */
    static async setMainUser(newMainUserId) {
        try {
            // Verificar que el usuario existe y es barbero o admin
            const sql = `
                SELECT id, nombre, apellido, email, rol, estado
                FROM usuarios 
                WHERE id = ? AND (rol = 'barbero' OR rol = 'admin') AND estado = 'activo'
            `;
            
            const users = await query(sql, [newMainUserId]);
            
            if (users.length === 0) {
                throw new Error('El usuario especificado no existe o no es un barbero/administrador activo');
            }

            // Limpiar caché y establecer nuevo usuario principal
            this.clearCache();
            this.mainUserId = newMainUserId;
            this.mainUserData = users[0];
            this.lastCheck = Date.now();

            console.log(`🔄 Usuario principal cambiado a: ID ${newMainUserId} - ${users[0].nombre} ${users[0].apellido}`);
            return true;

        } catch (error) {
            console.error('Error al cambiar usuario principal:', error);
            throw error;
        }
    }
}

module.exports = UserService; 