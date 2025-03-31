const Google = require('@auth/core/providers/google');
const LinkedIn = require('@auth/core/providers/linkedin');
const { ExpressAuth, getSession } = require('@auth/express');
const Credentials = require("@auth/express/providers/credentials")
const User = require('../Models/userModel')
const Vendor = require('../Models/vendorModel')
const { hashPassword, getUserFromDb } = require('../Utils/user');

config = {
    debug:true,
    providers: [
        Google.default({
            allowDangerousEmailAccountLinking: true,
            // checks: ['none'],
        }),
        LinkedIn.default({
            // checks: ['none'],
        }
        ),
        Credentials.default({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },

            authorize: async (credentials) => {
                let user = null
                console.log(credentials)
                // logic to salt and hash password
                // const pwHash = hashPassword(credentials.password)

                // logic to verify if the user exists
                user = await getUserFromDb(credentials.email, credentials.password)
                console.log(user)

                if (!user) {
                    return null
                }

                // return user object with the their profile data
                return {
                    userid: user._id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    image: user.image || '', // Add default image if needed
                    // firstName: user.firstName,
                    // lastName: user.lastName
                };
            },

        })
    ],
    // adapter: MongoDBAdapter(client),
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            console.log('signIn', user, profile, email, credentials)
            // Check if the user exists in the database
            let existingUser = await User.findOne({ email: user.email });
            console.log(existingUser)

            if(!existingUser){
                existingUser = await Vendor.findOne({
                    email: user.email
                });
            }

            // if (existingUser == null) {
            // If the user does not exist, create a new user
            // const newUser = new User({
            //   name: user.name || profile.name,
            //   email: user.email,
            //   image: user.image || profile.picture,
            //   password: '', // Password is not required for OAuth users
            // });
            // await newUser.save();
            // return '/signup';
            // }
            // if (!existingUser) {
            //   // Redirect to the signup page if the user does not exist
            //   return `/signup?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || profile.name)}`;
            // }
            if (!existingUser) {
                // Extract first name and last name from the user's full name
                const fullName = user.name || profile.name;
                const [firstName, ...lastNameParts] = fullName.split(' ');
                const lastName = lastNameParts.join(' ');

                // Redirect to the signup page if the user does not exist
                return `/auth/signup?email=${encodeURIComponent(user.email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;
            }
            if ((!existingUser.image || existingUser.image === '') && (user.image || profile?.picture)) {
                const newImage = user.image || profile.picture;
                await User.findByIdAndUpdate(existingUser._id, {
                    image: newImage
                });
                existingUser.image = newImage;
            }
            return existingUser;
        },
        async redirect({ url, baseUrl }) {
            // console.log(url, baseUrl)
            if (url.startsWith('/auth/signup')) {
                // return `http://localhost:3000/auth${url}`;
                return `${process.env.FRONTEND_URL}${url}`;
            }
            // Redirect to the frontend after successful login
            // return 'http://localhost:3000';
            return process.env.FRONTEND_URL;
        },
        jwt({ token, user }) {
            if (user) { // User is available during sign-in
                token.userid = user.userid
            }
            return token
        },
        session({ session, token }) {
            // Add property to the session object
            // session.user = user;
            session.user.userid = token.userid;
            return session;
        },
    },
    // cookies: {
    //     sessionToken: {
    //         name: 'next-auth.session-token',
    //         options: {
    //             httpOnly: true,
    //             sameSite: 'none',
    //             secure: true,
    //         },
    //     },
    // },
    // skipCSRFCheck: true,

}

module.exports = config;