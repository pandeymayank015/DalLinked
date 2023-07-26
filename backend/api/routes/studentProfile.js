const express = require('express');
const router = express.Router();

const studentProfileController = require('../controllers/studentProfile');
const jobSectorController = require('../controllers/jobSectors');

const requireStudentAuth = require('../../middleware/requireStudentAuth')
const {registerEmployer} = require("../controllers/employerReg");

const multer = require('multer');
const upload = multer();


// This ensures that all these student routes are authenticated

router.use(requireStudentAuth)

router.get('/', studentProfileController.getStudentProfileByStudentId);

router.delete('/delete', studentProfileController.deleteStudentProfileByStudentId);

router.get('/job-sectors', jobSectorController.getAllJobSectors);

router.put('/update-details', studentProfileController.updateStudentProfileByStudentId)

router.put('/profile-picture', upload.single('profilePicture'),studentProfileController
    .updateStudentProfilePicture)

router.put('/resume', upload.single('resume'),studentProfileController.updateStudentResume)

module.exports = router;
