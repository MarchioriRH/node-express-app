const pool = require('../database');
const helpers = require('../lib/helpers');

// Funciones comunes
/**
 * Obtiene un usuario por su ID
 * @param {*} id 
 * @returns  
 */
async function getUserById(id) {
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    if (users.length === 0) return null;
    return users[0];
}

/**
 * Obtiene todos los usuarios de la BBDD
 * @returns 
 */
async function getAllUsers() {
    return await pool.query('SELECT * FROM users');
}

/**
 * Obtiene un usuario por su nombre de usuario
 * @param {*} username 
 * @returns 
 */
async function getUserByUsername(username) {
    const users = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return null;
    return users[0];
}

/**
 * Maneja el caso en que un usuario no sea encontrado
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
function handleUserNotFound(req, res) {
    req.flash('message', 'Usuario no encontrado');
    return res.redirect('/users');
}

/**
 * Funcion para actualizar el estado de un usuario en la BBDD
 * @param {*} req 
 * @param {*} res 
 * @param {*} id 
 * @param {*} role 
 * @param {*} status 
 * @param {*} newPassword 
 * @returns 
 */
async function updateUserStatus(req, res, id, status, newPassword = null) {
    try {
        const user = await getUserById(id);
        if (!user) return handleUserNotFound(req, res);
        
        // Obtener la lista de roles desde req.body
        let roles = req.body['role[]'];

        // Verificar si es un array o solo un valor
        if (!Array.isArray(roles)) {
            roles = [roles];  // Si es un solo valor, lo convertimos en un array
        }
        
        user.status = status;
        if (req.body.fullname) {
            user.fullname = req.body.fullname;
        }    
        if (req.body.email) {
            user.email = req.body.email;
        }
        if (newPassword) {
            user.password = await helpers.encryptPassword(newPassword);
        }
        if (user.isnew === 1 && status === 'activo') {
            user.isnew = 0;
        }

        await pool.query('UPDATE users SET ? WHERE id = ?', [user, id]);
        
        await updateUserRoles(id, roles);

        req.flash('success', 'Usuario actualizado satisfactoriamente');
        const pendingUsers = await pool.query('SELECT * FROM users WHERE isnew = 1');
        res.redirect(pendingUsers.length === 0 ? '/users' : '/users/pending');
    } catch (error) {
        req.flash('message', 'Error al actualizar el usuario');
        res.redirect('/users');
    }
}

/**
 * Actializa los roles de un usuario en la BBDD
 * @param {*} id 
 * @param {*} newRoles 
 */
async function updateUserRoles (id, newRoles) {
    try {
        // Se Obtienen los roles actuales del usuario desde la tabla users_roles
        const currentRoleNames = await getUserRoles(id);
        
        // Se Comparan los roles nuevos con los actuales

        // Roles para agregar (en newRoles pero no en currentRoles)
        const rolesToAdd = newRoles.filter(role => !currentRoleNames.includes(role));
        
        // Roles para eliminar (en currentRoles pero no en newRoles)
        const rolesToRemove = currentRoleNames.filter(role => !newRoles.includes(role));
        
        // Se agregan los nuevos roles a users_roles
        for (const role of rolesToAdd) {
            const roleId = await pool.query('SELECT id FROM roles WHERE nombre = ?', [role]);
            if (roleId.length > 0) {
                await pool.query('INSERT INTO users_roles SET ?', { user_id: id, role_id: roleId[0].id });
                console.log(`Role '${role}' added to user ${id}`);
            }
        }

        // Se liminan los roles no seleccionados de users_roles
        for (const role of rolesToRemove) {
            const roleId = await pool.query('SELECT id FROM roles WHERE nombre = ?', [role]);
            if (roleId.length > 0) {
                await pool.query('DELETE FROM users_roles WHERE user_id = ? AND role_id = ?', [id, roleId[0].id]);
                console.log(`Role '${role}' removed from user ${id}`);
            }
        }

    } catch (error) {
        console.error('Error updating user roles:', error);
    }
};

/**
 * Obtiene los roles de cada usuario utilizando un JOIN para evitar múltiples consultas
 * @param {*} userId 
 * @returns 
 */
async function getUserRoles(userId) {    
    const userRoles = await pool.query(`SELECT r.nombre 
        FROM users_roles ur 
        INNER JOIN roles r 
        ON ur.role_id = r.id  
        WHERE ur.user_id = ?`, [userId]);
    return userRoles.map(role => role.nombre);
}

module.exports = {
    getUserById,
    handleUserNotFound,
    updateUserStatus,
    updateUserRoles,
    getUserRoles,
    getAllUsers,
    getUserByUsername
};