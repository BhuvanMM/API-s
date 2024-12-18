const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Token is missing or improperly formatted.'
        });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verify;
        next();
    } catch (err) {
        res.status(401).json({
            error: 'Invalid token',
            message: 'Session has expired or token is invalid.'
        });
    }
};

module.exports = authMiddleware;
