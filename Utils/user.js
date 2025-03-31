const bcrypt = require('bcrypt');
// const { getUserById } = require('../database/userQueries');
const User = require('../Models/userModel');
const Vendor = require('../Models/vendorModel');
const saltRounds = 10;

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
    const match = await bcrypt.compare(password, hashedPassword);
    console.log('Password match:', match);
    return match;
}

async function getUserFromDb(email, password) {
    try {
        // const user = await User.findOne({ email, password });
        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found in users database');
        }
        user = await Vendor.findOne({ email });
        if (!user) {
            console.log('User not found in vendors database');
            return null;
        }
        console.log('User from database:', user);
        console.log(user.email);
        console.log(password);
        const match = await verifyPassword(password, user.password);
        if (!match) {
            console.log('Password does not match');
            return null;
        }
        // console.log('User from database:', user);
        return user;
    } catch (error) {
        console.error('Error fetching user from database:', error);
        throw error;
    }
}
async function hashed() {
    console.log(await hashPassword('password'))
};

hashed()

module.exports = {
    hashPassword,
    verifyPassword,
    getUserFromDb,
};