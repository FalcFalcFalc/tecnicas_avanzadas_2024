export default function isAuthenticated(req,res,next,inverse = false) {
    if(!!req.session.user === inverse)
    {
        res.status(401).send((!inverse ? "No" : "Ya") + " iniciaste sesion.")
    }
    else{
        next();
    }
}
