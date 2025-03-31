const ToBeOnboarded = require('../Models/toBeOnboardedModel');
const { uuid } = require('uuidv4');
const Vendor = require('../Models/vendorModel');
const MailService = require('../Utils/mail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports.completeOnboarding = async (req, res) => {
  try {
    console.log(req.body)
    let { uniqueLink, type, purposes, spaceDetails, address } = req.body;
    console.log(uniqueLink)

    address = JSON.parse(address);
    spaceDetails = JSON.parse(spaceDetails);

    const vendor = await ToBeOnboarded.findOne({ uniqueLink });
    if (!vendor) {
      return res.status(400).json({ message: 'Invalid link' });
    }

    
    const images = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const spaceLogo = req.files && req.files['spaceLogo'] ? req.files['spaceLogo'][0].path : undefined;
    const orgLogo = req.files && req.files['orgLogo'] ? req.files['orgLogo'][0].path : undefined;

    // Generate a random password
    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save vendor details to the main vendor collection
    const newVendor = await Vendor.create({
      email: vendor.email,
      name: vendor.name,
      contact: spaceDetails.contact,
      type,
      purposes,
      address: {
        city: address.city,
        state: address.state,
        address: address.address,
        zipCode: address.zipCode,
        country: address.country,
        orgName: address.orgName,
        orgEmail: address.orgEmail,
      },
      spaceDetails: {
        name: spaceDetails.name,
        email: spaceDetails.email,
        contact: spaceDetails.contact,
        inchargeName: spaceDetails.inchargeName,
        website: spaceDetails.website,
        timings: {
          from: spaceDetails.timings.from,
          to: spaceDetails.timings.to,
        },
        daysOpen: spaceDetails.daysOpen,
      },
      media: {
        images,
        spaceLogo,
        orgLogo,
      },
      password: hashedPassword,
    });

    // Remove from "to be onboarded" list
    await ToBeOnboarded.deleteOne({ uniqueLink });

    // Send onboarding complete email with auto-generated password
    // await MailService.sendVendorOnboardingCompleteEmail(vendor.email, password);

    await newVendor.save();

    res.status(200).json({ message: 'Onboarding complete' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports.scheduleMeeting = async (req, res) => {
  try {
    const { invitee_email, invitee_full_name, event_start_time, event_end_time } = req.query;
    // Add entry to "to be onboarded" list
    await ToBeOnboarded.create({
      email: invitee_email,
      name: invitee_full_name,
      eventStartTime: event_start_time,
      eventEndTime: event_end_time,
    });
    res.redirect(process.env.FRONTEND_URL + "/");
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

module.exports.verifyLink = async (req, res) => {
  const { uniqueLink } = req.query;
  const vendor = await ToBeOnboarded.findOne({ uniqueLink });
  res.json({ valid: !!vendor });
};

// module.exports.completeOnboarding = async (req, res) => {
//   try {
//     const { uniqueLink, ...vendorDetails } = req.body;
//     const vendor = await ToBeOnboarded.findOne({ uniqueLink });
//     if (!vendor) {
//       return res.status(400).json({ message: 'Invalid link' });
//     }

//     // Save vendor details to the main vendor collection
//     await Vendor.create(vendorDetails);

//     // Remove from "to be onboarded" list
//     await ToBeOnboarded.deleteOne({ uniqueLink });

//     res.status(200).json({ message: 'Onboarding complete' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };