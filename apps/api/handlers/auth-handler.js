import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userRepo } from '../repos/user-repo.js';

// Initialize auth and register pre users
export const initializeAuth = (app) => {
    userRepo.register(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
    userRepo.register(process.env.GUEST_EMAIL, process.env.GUEST_PASSWORD)

    app.post('/login', login);
};

// login
export const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // find user by email
    const user = userRepo.findByEmail(email);

    if (!user) {
        return res.status(404).send('User not found.');
    }

    // compare password
    bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (!result) {
            return res.status(401).send('Invalid password.');
        }

        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.send({ token });
    });
}

// authorize
export const authorize = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send('Unauthorized.');
    }

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized.');
        }

        next();
    });
}