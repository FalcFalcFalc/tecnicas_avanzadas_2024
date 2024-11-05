/**
 * Verifica que el usuario haya iniciado sesion
 * @param {Request} req 
 * @param {Function} next que haces si está iniciado
 * @param {Function} error que hacer si no está iniciado
 */
export  function isAuthenticated(req,next,error) {
    if(!req.session.user) 
    {
        error("No inició sesión");
    }
    else{
        next();
    }
}

/**
 * Verifica que el usuario en la sesion sea administrador
 * @param {Request} req 
 * @param {Function} next que haces si está iniciado
 * @param {Function} error que hacer si no está iniciado
 */
export  function isAdmin(req,next,error) {
    if(!req.session?.user?.admin)
    {
        error("Acceso restringido");
    }
    else{
        next();
    }
}
