export default function isAuthenticated(req,res,next) {
    if(!req.session.user)
    {
        res.status(401).send("No iniciaste sesion!")
    }
    else{
        next();
    }
}
