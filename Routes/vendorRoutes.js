const router = require('express').Router();
const { updateSpace, addMachine, updateMachineStatus, updateSpaceStatus,scheduleMeeting,generateOnboardingLink, verifyLink, completeOnboarding} = require('../Controller/vendorController');
const multer = require('multer');

// router.put('/:id', updateSpace);
// router.post('/:spaceId/machines', addMachine);
// router.put('/machines/:id/status', updateMachineStatus);
// router.put('/:id/status', updateSpaceStatus);
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
  }
})
const upload = multer({ storage: storage })
router.get('/scheduleMeeting',scheduleMeeting);
// router.get('/generateOnboardingLink', generateOnboardingLink);

router.get('/verify-link', verifyLink);
router.post('/complete-onboarding', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'spaceLogo', maxCount: 1 },
    { name: 'orgLogo', maxCount: 1 },
  ]), completeOnboarding);
  

module.exports = router;