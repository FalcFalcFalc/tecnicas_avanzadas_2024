export  function isAuthenticated(req,next,error) {
    if(!req.session.user) 
    {
        error("No inició sesión");
    }
    else{
        next();
    }
}

export  function isAdmin(req,next,error) {
    if(!req.session?.user?.admin)
    {
        error("Acceso restringido");
    }
    else{
        next();
    }
}
