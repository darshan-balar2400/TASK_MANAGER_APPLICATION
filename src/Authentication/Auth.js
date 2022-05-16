const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const Auth = async (req,res,next) => {
    try{
        const authToken = req.header("Authorization").replace("Bearer ","");
        if(!authToken){
           throw new Error("Please Authenticate ! ");
        }
        // if user is authenticate
        // then verify the token
        const verifyToken = jwt.verify(authToken,process.env.SECRET_KEY);
        if(!verifyToken){
            throw new Error("User is not valid ! ");
        }
        // if user is valid
        const getUser = await User.findOne({_id:verifyToken._id,"tokens.token":authToken});

        if(!getUser){
            throw new Error("Please Authenticate ! ");
        }

        req.user = getUser;
        req.token = authToken;

        next();
    }
    catch(e){
        res.status(401).send(`${e}`);
    }
}
module.exports = Auth;