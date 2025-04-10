const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const machineRoutes = require('./Routes/machineRoutes');
const vendorRoutes = require('./Routes/vendorRoutes');
const authRoutes = require('./Routes/authRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const userRoutes = require('./Routes/userRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const spaceRoutes = require('./Routes/spaceRoutes.js');
const eventRoutes = require('./Routes/eventRoutes');




const { connect } = require('./Utils/Mongoose');
// const { getSession } = require('@auth/express');
const app = express();
const port = process.env.PORT || 3001;

require("econsole").enhance({ level: "TRACE" });

const config = require('./Utils/authConfig');

// Auth0 Current Session
// async function authSession(req, res, next) {
//   res.locals.session = await getSession(req, config)
//   next()
// }
// app.use(authSession)

// Auth.js setup
// If your app is served through a proxy
// trust the proxy to allow us to read the `X-Forwarded-*` headers
app.set("trust proxy", true)

app.use(cors(
  {
    origin:'*',
    credentials:true
  }
));
app.use(bodyParser.json());

app.use('/api/machines', machineRoutes);
// app.use('/api/vendor', vendorRoutes);
// app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
// app.use('/api/payment',paymentRoutes );
app.use('/api/statics/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/makerspaces', spaceRoutes);
app.use('/api/events', eventRoutes);



app.use('/', (req, res) => {
  res.send('Welcome to Maker App Backend');
});

// MongoDB Connection
connect();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});