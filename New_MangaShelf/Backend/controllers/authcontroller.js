const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

class AuthController {
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { username, email, password } = req.body;

            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: existingUser.email === email 
                        ? 'Email already registered' 
                        : 'Username already taken'
                });
            }

            const user = new User({ username, email, password });
            await user.save();

            const payload = { userId: user._id, username: user.username };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        theme: user.preferences.theme
                    },
                    tokens: { accessToken, refreshToken }
                }
            });

        } catch (error) {
            console.error('Registration error:', error.message, error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { login, password } = req.body;

            const user = await User.findOne({
                $or: [
                    { email: login.toLowerCase() },
                    { username: login }
                ],
                isActive: true
            }).select('+password');

            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const payload = { userId: user._id, username: user.username };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            await user.updateLastLogin();

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        theme: user.preferences.theme
                    },
                    tokens: { accessToken, refreshToken }
                }
            });

        } catch (error) {
            console.error('Login error:', error.message, error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token required'
                });
            }

            const decoded = verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId);
            
            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            const payload = { userId: user._id, username: user.username };
            const newAccessToken = generateAccessToken(payload);

            res.json({
                success: true,
                data: { accessToken: newAccessToken }
            });

        } catch (error) {
            console.error('Refresh token error:', error.message, error);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        theme: user.preferences.theme,
                        lastLogin: user.lastLogin,
                        createdAt: user.createdAt
                    }
                }
            });

        } catch (error) {
            console.error('Get profile error:', error.message, error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async updateTheme(req, res) {
        try {
            const { theme } = req.body;
            
            if (!['light', 'dark', 'system'].includes(theme)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid theme. Must be: light, dark, or system'
                });
            }

            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            user.preferences.theme = theme;
            await user.save();

            res.json({
                success: true,
                message: 'Theme updated',
                data: { theme: user.preferences.theme }
            });

        } catch (error) {
            console.error('Update theme error:', error.message, error);
            res.status(500).json({
                success: false,
                message: 'Failed to update theme',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AuthController();