const mongoose = require("mongoose");

const Job = require("../models/jobs");
const StudentProfile = require("../models/studentProfile");

const appliedJobsSchema = new mongoose.Schema({
  studentId: {
    required: true,
    type: String,
  },
  jobId: {
    required: true,
    type: String,
  },
  appliedDate: {
    required: true,
    type: Date,
  },
  status: {
    required: true,
    type: String,
  },
  job: {
    required: true,
    type: Job.schema,
  },
  student: {
    required: true,
    type: StudentProfile.schema,
  }
});

module.exports = mongoose.model("AppliedJobs", appliedJobsSchema);
