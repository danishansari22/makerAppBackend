
         

const User = require('../Models/userModel')
const { hashPassword, getUserFromDb } = require('../Utils/user')
const MailService = require('../Utils/mail')
const router = require('express').Router();
const crypto = require('crypto');
const config = require('../Utils/authConfig')
// config = {
//     providers: [
//       Google.default({
//         allowDangerousEmailAccountLinking: true,
//       }),
//       LinkedIn.default,
//       Credentials.default({
//         // You can specify which fields should be submitted, by adding keys to the `credentials` object.
//         // e.g. domain, username, password, 2FA token, etc.
//         credentials: {
//           email: {},
//           password: {},
//         },
  
//         authorize: async (credentials) => {
//           let user = null
//           console.log(credentials)
//           // logic to salt and hash password
//           // const pwHash = hashPassword(credentials.password)
  
//           // logic to verify if the user exists
//           user = await getUserFromDb(credentials.email, credentials.password)
//           console.log(user)
  
//           if (!user) {
//             return null
//           }
  
//           // return user object with the their profile data
//           return {
//             userid: user._id,
//             email: user.email,
//             name: `${user.firstName} ${user.lastName}`,
//             image: user.image || '', // Add default image if needed
//             // firstName: user.firstName,
//             // lastName: user.lastName
//           };
//         },
  
//       })
//     ],
//     // adapter: MongoDBAdapter(client),
//     callbacks: {
//       async signIn({ user, account, profile, email, credentials }) {
//         console.log('signIn', user, profile, email, credentials)
//         // Check if the user exists in the database
//         let existingUser = await User.findOne({ email: user.email });
//         console.log(existingUser)
//         // if (existingUser == null) {
//           // If the user does not exist, create a new user
//           // const newUser = new User({
//           //   name: user.name || profile.name,
//           //   email: user.email,
//           //   image: user.image || profile.picture,
//           //   password: '', // Password is not required for OAuth users
//           // });
//           // await newUser.save();
//           // return '/signup';
//         // }
//         // if (!existingUser) {
//         //   // Redirect to the signup page if the user does not exist
//         //   return `/signup?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || profile.name)}`;
//         // }
//         if (!existingUser) {
//           // Extract first name and last name from the user's full name
//           const fullName = user.name || profile.name;
//           const [firstName, ...lastNameParts] = fullName.split(' ');
//           const lastName = lastNameParts.join(' ');
  
//           // Redirect to the signup page if the user does not exist
//           return `/signup?email=${encodeURIComponent(user.email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;
//         }
//         if ((!existingUser.image || existingUser.image === '') && (user.image || profile?.picture)) {
//           const newImage = user.image || profile.picture;
//           await User.findByIdAndUpdate(existingUser._id, {
//             image: newImage
//           });
//           existingUser.image = newImage;
//         }
//         return existingUser;
//       },
//       async redirect({ url, baseUrl }) {
//         // console.log(url, baseUrl)
//         if (url.startsWith('/signup')) {
//           // return `http://localhost:3000/auth${url}`;
//           return `${process.env.FRONTEND_URL}${url}`;
//         } 
//         // Redirect to the frontend after successful login
//         // return 'http://localhost:3000';
//         return process.env.FRONTEND_URL;
//       },
//       jwt({ token, user }) {
//         if (user) { // User is available during sign-in
//           token.userid = user.userid
//         }
//         return token
//       },
//       session({ session, token }) {
//         // Add property to the session object
//         // session.user = user;
//         session.user.userid = token.userid;
//         return session;
//       },
//     }
// }

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, mobile, userType, industry, purpose } = req.body;

    console.log(email, password, firstName, lastName, mobile, userType, industry, purpose )
    // console.log(password)
    // Check if the user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({
      email,
      password: await hashPassword(password),
      firstName,
      lastName,
      mobile,
      userType,
      industry,
      purpose,
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    console.log(res.locals.session)
    const { email } = req.body;
    console.log(email)
    const user = await User.findOne({ email }) || await Vendor.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const result = await MailService.sendPasswordResetEmail(email, resetToken);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log(token)
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    }) || await Vendor.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password and update user
    user.password = await hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// router.use("/*", ExpressAuth(config))

module.exports = router;