const ToBeOnboarded = require('../Models/toBeOnboardedModel');
const MailService = require('../Utils/mail');
const { v4: uuidv4 } = require('uuid');

module.exports.generateOnboardingLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await ToBeOnboarded.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uniqueLink = uuidv4();
    const onboardingLink = `${process.env.FRONTEND_URL}/vendor-space/onboarding/${uniqueLink}`;

    // Update the user with the unique link
    user.uniqueLink = uniqueLink;
    await user.save();

    // Send onboarding link to the user's email
    await MailService.sendVendorOnboardingEmail(email, onboardingLink);

    res.status(200).json({ message: 'Onboarding link generated and sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports.getToBeOnboardedList = async (req, res) => {
  try {
    const toBeOnboardedList = await ToBeOnboarded.find();
    res.json(toBeOnboardedList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};