const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
dotenv.config();

const User = require('../models/User');
const Department = require('../models/Department');
const Report = require('../models/Report');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ Passed: ${message}`);
};

const runTests = async () => {
  console.log('\n=============================================');
  console.log('🧪 Starting CivicTrack Backend Automated Tests');
  console.log('=============================================\n');

  try {
    await connectDB();

    // Clean test collections
    await Promise.all([
      User.deleteMany({ email: { $regex: /@test\.com$/ } }),
      Department.deleteMany({ code: 'TEST-DEPT' }),
      Report.deleteMany({ title: { $regex: /^\[TEST\]/ } }),
    ]);

    console.log('TEST SUITE 1: User Registration, Hashing & Authentication');
    // 1. Create Citizen User
    const citizen = await User.create({
      name: 'Test Citizen',
      email: 'citizen@test.com',
      password: 'password123',
      role: 'citizen',
    });
    assert(citizen._id, 'Citizen created successfully with ID');
    assert(citizen.role === 'citizen', 'Citizen role assigned correctly');
    
    // Check password hashing
    const citizenWithPass = await User.findById(citizen._id).select('+password');
    assert(
      citizenWithPass.password !== 'password123' && citizenWithPass.password.startsWith('$2'),
      'Password successfully hashed with bcrypt'
    );
    const isMatch = await citizenWithPass.matchPassword('password123');
    assert(isMatch === true, 'matchPassword accurately validates correct password');
    const isWrongMatch = await citizenWithPass.matchPassword('wrongpass');
    assert(isWrongMatch === false, 'matchPassword rejects incorrect password');

    // 2. Create Admin & Staff
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    assert(admin.role === 'admin', 'Admin user created successfully');

    const dept = await Department.create({
      name: 'Test Infrastructure Dept',
      code: 'TEST-DEPT',
      slaHours: 24,
    });
    assert(dept._id, 'Department created successfully');

    const staff = await User.create({
      name: 'Test Staff',
      email: 'staff@test.com',
      password: 'password123',
      role: 'staff',
      department: dept._id,
    });
    assert(staff.role === 'staff', 'Staff user created with department relation');

    console.log('\nTEST SUITE 2: Issue Creation with GeoJSON 2dsphere');
    const report = await Report.create({
      title: '[TEST] Broken Water Main',
      description: 'Severe leak flooding the road for testing purposes.',
      category: 'Water Supply & Leakage',
      priority: 'High',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
      },
      address: 'Test Address 123, Sector 5',
      reporter: citizen._id,
      assignedDepartment: dept._id,
      activityLogs: [
        {
          action: 'Report Submitted',
          by: citizen._id,
          byName: citizen.name,
          role: citizen.role,
          toStatus: 'Submitted',
        },
      ],
    });

    assert(report._id, 'Report created in MongoDB');
    assert(report.status === 'Submitted', 'Default report status is Submitted');
    assert(report.location.type === 'Point', 'GeoJSON Point type is valid');
    assert(
      report.location.coordinates[0] === 77.2090 && report.location.coordinates[1] === 28.6139,
      'GeoJSON coordinates [lng, lat] recorded accurately'
    );

    console.log('\nTEST SUITE 3: Workflow State Machine & Status Transitions');
    // Transition 1: Submitted -> Assigned
    report.status = 'Assigned';
    report.assignedStaff = staff._id;
    report.deadline = new Date(Date.now() + 24 * 3600000);
    report.activityLogs.push({
      action: 'Report Assigned',
      by: admin._id,
      byName: admin.name,
      role: 'admin',
      toStatus: 'Assigned',
    });
    await report.save();
    assert(report.status === 'Assigned', 'Status moved to Assigned');

    // Transition 2: Assigned -> In Progress
    report.status = 'In Progress';
    report.activityLogs.push({
      action: 'Work Started',
      by: staff._id,
      byName: staff.name,
      role: 'staff',
      toStatus: 'In Progress',
    });
    await report.save();
    assert(report.status === 'In Progress', 'Status moved to In Progress by staff');

    // Transition 3: In Progress -> Resolved with Evidence
    report.status = 'Resolved';
    report.resolvedAt = new Date();
    report.resolutionEvidence.push({
      url: 'https://example.com/test-evidence.jpg',
      note: 'Replaced pipe valve',
      uploadedBy: staff._id,
    });
    report.activityLogs.push({
      action: 'Resolved with Evidence',
      by: staff._id,
      toStatus: 'Resolved',
    });
    await report.save();
    assert(report.status === 'Resolved', 'Status moved to Resolved');
    assert(report.resolutionEvidence.length === 1, 'Resolution evidence recorded');

    // Transition 4: Citizen Verification -> Verified
    report.status = 'Verified';
    report.verifiedAt = new Date();
    report.citizenFeedback = {
      confirmed: true,
      comments: 'Work confirmed clean and complete',
      rating: 5,
    };
    report.activityLogs.push({
      action: 'Citizen Verified Resolution',
      by: citizen._id,
      toStatus: 'Verified',
    });
    await report.save();
    assert(report.status === 'Verified', 'Status finalized as Verified by citizen');
    assert(report.activityLogs.length === 5, 'All 5 sequential activity audit log entries preserved');

    // Cleanup test data
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Department.deleteMany({ code: 'TEST-DEPT' });
    await Report.deleteMany({ title: { $regex: /^\[TEST\]/ } });

    console.log('\n=============================================');
    console.log('🎉 All Automated Tests Passed Successfully!');
    console.log('=============================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Execution Failed:', err);
    await disconnectDB();
    process.exit(1);
  }
};

runTests();
