export  function isAuthenticated(req,res,next,inverse = false) {
    if(!!req.session.user === inverse) // si inverso está desactivado o en default, si el usuario no está en la sesion, no pasara
    {                                  // si inverso está activado, si el usuario esta en la sesion, no pasará
        res.status(401).send((!inverse ? "No" : "Ya") + " iniciaste sesion.")
    }
    else{
        next();
    }
}

export  function isAdmin(req,res,next) {
    if(!req.session.user.admin)
    {
        res.status(401).send("Privilegios insuficientes.")
    }
    else{
        next();
    }
}
