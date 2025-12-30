const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

function assertSecrets() {
    if (!ACCESS_SECRET || !REFRESH_SECRET) {
        throw new Error('JWT secrets are not configured');
    }
}

function signToken(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn, issuer: 'manga-shelf' });
}

function generateAccessToken(payload) {
    assertSecrets();
    return signToken(payload, ACCESS_SECRET, ACCESS_EXPIRES_IN);
}

function generateRefreshToken(payload) {
    assertSecrets();
    return signToken(payload, REFRESH_SECRET, REFRESH_EXPIRES_IN);
}

function verifyAccessToken(token) {
    assertSecrets();
    return jwt.verify(token, ACCESS_SECRET, { issuer: 'manga-shelf' });
}

function verifyRefreshToken(token) {
    assertSecrets();
    return jwt.verify(token, REFRESH_SECRET, { issuer: 'manga-shelf' });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
