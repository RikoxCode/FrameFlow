import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userRepo } from '../repos/user-repo.js';

// Initialize auth and register pre users
export const initializeAuth = (app, baseUrl) => {
    userRepo.register(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
    userRepo.register(process.env.GUEST_EMAIL, process.env.GUEST_PASSWORD)

    app.post(baseUrl+'/login', login);
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

        const expiresIn = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

        const token = jwt.sign({ email: email, exp: expiresIn }, process.env.JWT_SECRET);

        res.send({ token });
    });
}

// authorize
export const authorize = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send('Unauthorized.');
    }

    const decoded = jwt.decode(token.split(' ')[1]);

    if(decoded.exp <= Date.now()) {
        return res.status(401).send('Token expired.');
    }

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized.');
        }

        next();
    });
}