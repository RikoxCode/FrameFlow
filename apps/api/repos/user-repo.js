import bcrypt from 'bcryptjs';

export const userRepo = {
    users: [],
    register: function (email, password) {

        if(this.findByEmail(email)){
            throw new Error('User already exists');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = {
            id: this.users.length + 1,
            email,
            password: hashedPassword
        }

        this.users.push(user);
    },
    findByEmail: function (email) {
        return this.users.find((user) => user?.email === email);
    }
}