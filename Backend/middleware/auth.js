const { verifyAccessToken } = require('../utils/jwt');

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const [, token] = authHeader.split(' ');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authorization token missing' });
        }

        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

module.exports = { authenticate };
