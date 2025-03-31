// import dotenv from 'dotenv'
// dotenv.config()

// import { ExpressAuth } from "@auth/express"
// import express from "express"
// import mongoose from 'mongoose'
// import cors from 'cors'
// import bodyParser from 'body-parser'
// import { connect } from "./Utils/Mongoose.js";
// import Google from "@auth/express/providers/google"

// const app = express()

// // If your app is served through a proxy
// // trust the proxy to allow us to read the `X-Forwarded-*` headers
// app.set("trust proxy", true)
// app.use("/api/auth/*", ExpressAuth({
//     providers: [Google],
//     callbacks: {
//         async signIn({ user, account, profile, email, credentials }) {
//             console.log('signIn', user, account, profile, email, credentials)
//             return true;
//         },
//         async redirect({ url, baseUrl }) {
//             // Redirect to the frontend after successful login
//             return 'http://localhost:3000';
//         }
//     }
// }))



// const port = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Connect to MongoDB
// connect();

// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

// app.get('/', (req, res) => {
//     res.send('Hello World');
// });

// app.get('/api', (req, res) => {
//     res.send('API is running');
// });