import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

module.exports = razorpay;