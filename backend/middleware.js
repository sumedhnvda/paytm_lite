const JWT_SECRET  = require("./routes/config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({msg:"no auth headers or wrong format"});
    }

    const token = authHeader.split(' ')[1];
    console.log(token)
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if(decoded.userID){
            req.userId = decoded.userID;
            next();
        }
    } catch (err) {
        return res.status(403).json({msg:"error"});
    }
};

module.exports = authMiddleware
