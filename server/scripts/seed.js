const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

dotenv.config();

const User = require('../models/User');
const Department = require('../models/Department');
const Report = require('../models/Report');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ReportFollow = require('../models/ReportFollow');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Report.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      ReportFollow.deleteMany({}),
    ]);

    console.log('[Seed] Creating municipal departments...');
    const departments = await Department.create([
      {
        name: 'Roads & Infrastructure',
        code: 'RD-INF',
        description: 'Potholes, road resurfacing, footpaths, bridges, and structural repairs.',
        contactEmail: 'roads@civictrack.org',
        contactPhone: '+91 11 2345 6781',
        slaHours: 48,
      },
      {
        name: 'Water & Sewage',
        code: 'WAT-SEW',
        description: 'Main pipeline leaks, contaminated water supply, blocked drains, and sewer overflows.',
        contactEmail: 'water@civictrack.org',
        contactPhone: '+91 11 2345 6782',
        slaHours: 24,
      },
      {
        name: 'Electrical & Lighting',
        code: 'ELE-LGT',
        description: 'Broken streetlights, hazardous low-hanging electrical cables, and power junction faults.',
        contactEmail: 'lighting@civictrack.org',
        contactPhone: '+91 11 2345 6783',
        slaHours: 36,
      },
      {
        name: 'Sanitation & Waste',
        code: 'SAN-WST',
        description: 'Overflowing garbage dumpsters, unauthorized dumping, and public bio-sanitation issues.',
        contactEmail: 'sanitation@civictrack.org',
        contactPhone: '+91 11 2345 6784',
        slaHours: 24,
      },
      {
        name: 'Traffic & Transportation',
        code: 'TRF-TRN',
        description: 'Dysfunctional traffic lights, missing road safety signs, and road barrier damages.',
        contactEmail: 'traffic@civictrack.org',
        contactPhone: '+91 11 2345 6785',
        slaHours: 36,
      },
      {
        name: 'Parks & Recreation',
        code: 'PRK-REC',
        description: 'Fallen trees, dangerous park playground equipment, and public garden upkeep.',
        contactEmail: 'parks@civictrack.org',
        contactPhone: '+91 11 2345 6786',
        slaHours: 72,
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d;
    });

    console.log('[Seed] Creating demo users (Admin, Staff, Citizens)...');
    // Admin
    const adminUser = await User.create({
      name: 'Elena Rostova (Chief Administrator)',
      email: 'admin@civictrack.org',
      password: 'password123',
      role: 'admin',
      phone: '+91 98110 00001',
      address: 'Central Municipal Headquarters, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    // Staff members
    const staffRoads = await User.create({
      name: 'Rajesh Verma (Roads Eng.)',
      email: 'staff.roads@civictrack.org',
      password: 'password123',
      role: 'staff',
      department: deptMap['RD-INF']._id,
      phone: '+91 98110 00002',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    });

    const staffWater = await User.create({
      name: 'Sunita Mehra (Water Supervisor)',
      email: 'staff.water@civictrack.org',
      password: 'password123',
      role: 'staff',
      department: deptMap['WAT-SEW']._id,
      phone: '+91 98110 00003',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    });

    const staffElectric = await User.create({
      name: 'Vikram Singh (Power Tech)',
      email: 'staff.electric@civictrack.org',
      password: 'password123',
      role: 'staff',
      department: deptMap['ELE-LGT']._id,
      phone: '+91 98110 00004',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    });

    const staffSanitation = await User.create({
      name: 'Manoj Kumar (Sanitation Lead)',
      email: 'staff.sanitation@civictrack.org',
      password: 'password123',
      role: 'staff',
      department: deptMap['SAN-WST']._id,
      phone: '+91 98110 00005',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    // Citizens
    const citizenAshish = await User.create({
      name: 'Ashish Sharma',
      email: 'citizen@civictrack.org',
      password: 'password123',
      role: 'citizen',
      phone: '+91 98110 11111',
      address: 'B-42, Green Park Extension, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });

    const citizenPriya = await User.create({
      name: 'Priya Patel',
      email: 'citizen.priya@civictrack.org',
      password: 'password123',
      role: 'citizen',
      phone: '+91 98110 22222',
      address: '15/A Connaught Circus, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const citizenRahul = await User.create({
      name: 'Rahul Sen',
      email: 'citizen.rahul@civictrack.org',
      password: 'password123',
      role: 'citizen',
      phone: '+91 98110 33333',
      address: '77 Saket District Centre, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    console.log('[Seed] Creating rich civic issue reports with geospatial data...');
    // Base center: New Delhi [77.2090, 28.6139]
    const reports = await Report.create([
      {
        title: 'Deep Hazardous Pothole on Outer Ring Road',
        description: 'Large pothole measuring approx 4 feet wide and 6 inches deep right after the flyover ramp. Multiple two-wheelers have skidded and damaged their rims. Needs immediate asphalt patching.',
        category: 'Pothole & Roads',
        status: 'In Progress',
        priority: 'Critical',
        location: {
          type: 'Point',
          coordinates: [77.2185, 28.6289], // [lng, lat]
        },
        address: 'Outer Ring Road, Near Munirka Flyover Ramp',
        locality: 'Munirka',
        landmark: 'Near Munirka Metro Pillar 114',
        reporter: citizenAshish._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
            publicId: 'pothole_ring_road_1',
          },
        ],
        assignedDepartment: deptMap['RD-INF']._id,
        assignedStaff: staffRoads._id,
        assignedAt: new Date(Date.now() - 36 * 3600000),
        deadline: new Date(Date.now() + 12 * 3600000),
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenAshish._id,
            byName: citizenAshish.name,
            role: 'citizen',
            note: 'Citizen submitted report with photo',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 40 * 3600000),
          },
          {
            action: 'Assigned to Roads Department',
            by: adminUser._id,
            byName: adminUser.name,
            role: 'admin',
            note: 'Assigned to Eng Rajesh Verma with 48h emergency SLA',
            fromStatus: 'Submitted',
            toStatus: 'Assigned',
            timestamp: new Date(Date.now() - 36 * 3600000),
          },
          {
            action: 'Status changed to In Progress',
            by: staffRoads._id,
            byName: staffRoads.name,
            role: 'staff',
            note: 'Road repair crew dispatched with asphalt mixture truck.',
            fromStatus: 'Assigned',
            toStatus: 'In Progress',
            timestamp: new Date(Date.now() - 10 * 3600000),
          },
        ],
      },
      {
        title: 'High-Pressure Clean Drinking Water Pipeline Burst',
        description: 'A massive burst in the main underground potable water line is flooding the entire lane and wasting thousands of liters of clean water. Water pressure in neighboring residential apartments has collapsed to zero.',
        category: 'Water Supply & Leakage',
        status: 'Assigned',
        priority: 'High',
        location: {
          type: 'Point',
          coordinates: [77.2024, 28.5683],
        },
        address: 'B-Block Main Market Road, Green Park',
        locality: 'Green Park',
        landmark: 'Opposite Community Hall Gate 2',
        reporter: citizenAshish._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800',
            publicId: 'water_leak_1',
          },
        ],
        assignedDepartment: deptMap['WAT-SEW']._id,
        assignedStaff: staffWater._id,
        assignedAt: new Date(Date.now() - 15 * 3600000),
        deadline: new Date(Date.now() + 9 * 3600000),
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenAshish._id,
            byName: citizenAshish.name,
            role: 'citizen',
            note: 'Emergency report logged',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 18 * 3600000),
          },
          {
            action: 'Assigned to Water Supervisor',
            by: adminUser._id,
            byName: adminUser.name,
            role: 'admin',
            note: 'Direct assignment due to severe loss of potable water',
            fromStatus: 'Submitted',
            toStatus: 'Assigned',
            timestamp: new Date(Date.now() - 15 * 3600000),
          },
        ],
      },
      {
        title: 'Three Darkened Streetlights Creating Safety Hazard',
        description: 'Three consecutive high-mast streetlights have been completely unlit for 5 days. Women and elderly pedestrians feel highly unsafe walking back from the metro station at night.',
        category: 'Streetlight',
        status: 'Resolved',
        priority: 'Medium',
        location: {
          type: 'Point',
          coordinates: [77.2295, 28.6129],
        },
        address: 'Pandara Road, Near Khan Market Corridor',
        locality: 'Khan Market',
        landmark: 'Near Pedestrian Crossing #4',
        reporter: citizenPriya._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=800',
            publicId: 'dark_lights_1',
          },
        ],
        assignedDepartment: deptMap['ELE-LGT']._id,
        assignedStaff: staffElectric._id,
        assignedAt: new Date(Date.now() - 72 * 3600000),
        deadline: new Date(Date.now() - 24 * 3600000),
        resolvedAt: new Date(Date.now() - 8 * 3600000),
        resolutionNote: 'Replaced burnt transformers and LED lighting fixtures on poles 14, 15, and 16. Power line voltage verified.',
        resolutionEvidence: [
          {
            url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
            publicId: 'lighting_fixed_proof',
            note: 'All three streetlights fully functional and inspected at 8:30 PM.',
            uploadedBy: staffElectric._id,
            uploadedAt: new Date(Date.now() - 8 * 3600000),
          },
        ],
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenPriya._id,
            byName: citizenPriya.name,
            role: 'citizen',
            note: 'Streetlight outage logged',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 80 * 3600000),
          },
          {
            action: 'Assigned to Electrical Department',
            by: adminUser._id,
            byName: adminUser.name,
            role: 'admin',
            note: 'Assigned to power squad',
            fromStatus: 'Submitted',
            toStatus: 'Assigned',
            timestamp: new Date(Date.now() - 72 * 3600000),
          },
          {
            action: 'Resolved with Evidence',
            by: staffElectric._id,
            byName: staffElectric.name,
            role: 'staff',
            note: 'Replaced fuses and lighting heads. All lit up.',
            fromStatus: 'Assigned',
            toStatus: 'Resolved',
            timestamp: new Date(Date.now() - 8 * 3600000),
          },
        ],
      },
      {
        title: 'Massive Overflowing Garbage Dumpster on Residential Corner',
        description: 'Municipal trash bin has been overflowing onto the pavement for over 48 hours. Stray animals are spreading waste across the road, causing unbearable foul odor and health risks.',
        category: 'Garbage & Sanitation',
        status: 'Verified',
        priority: 'High',
        location: {
          type: 'Point',
          coordinates: [77.2345, 28.6505],
        },
        address: 'Chandni Chowk Red Fort Peripheral Lane',
        locality: 'Old Delhi',
        landmark: 'Next to Municipal Public Toilets',
        reporter: citizenRahul._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800',
            publicId: 'garbage_pile_1',
          },
        ],
        assignedDepartment: deptMap['SAN-WST']._id,
        assignedStaff: staffSanitation._id,
        assignedAt: new Date(Date.now() - 90 * 3600000),
        deadline: new Date(Date.now() - 60 * 3600000),
        resolvedAt: new Date(Date.now() - 48 * 3600000),
        verifiedAt: new Date(Date.now() - 20 * 3600000),
        resolutionNote: 'Compact truck deployed. Entire site cleared, bleached, and disinfected with chlorine.',
        resolutionEvidence: [
          {
            url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
            publicId: 'cleaned_corner_proof',
            note: 'Area spotless and bin replaced with new sanitary unit.',
            uploadedBy: staffSanitation._id,
            uploadedAt: new Date(Date.now() - 48 * 3600000),
          },
        ],
        citizenFeedback: {
          confirmed: true,
          comments: 'Wonderful quick response by the sanitation team! The area is completely clean now.',
          rating: 5,
          submittedAt: new Date(Date.now() - 20 * 3600000),
        },
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenRahul._id,
            byName: citizenRahul.name,
            role: 'citizen',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 100 * 3600000),
          },
          {
            action: 'Assigned to Sanitation Lead',
            by: adminUser._id,
            byName: adminUser.name,
            role: 'admin',
            toStatus: 'Assigned',
            timestamp: new Date(Date.now() - 90 * 3600000),
          },
          {
            action: 'Resolved with Evidence',
            by: staffSanitation._id,
            byName: staffSanitation.name,
            role: 'staff',
            toStatus: 'Resolved',
            timestamp: new Date(Date.now() - 48 * 3600000),
          },
          {
            action: 'Citizen Verified Resolution',
            by: citizenRahul._id,
            byName: citizenRahul.name,
            role: 'citizen',
            note: 'Verified with 5-star rating',
            toStatus: 'Verified',
            timestamp: new Date(Date.now() - 20 * 3600000),
          },
        ],
      },
      {
        title: 'Open Broken Sewer Grating Causing Accident Threat',
        description: 'Cast iron storm drain cover has broken into two pieces, leaving a 2.5ft wide gaping opening directly on the pedestrian pathway. Children playing in the neighborhood are at extreme risk.',
        category: 'Drainage & Sewage',
        status: 'Submitted',
        priority: 'Critical',
        location: {
          type: 'Point',
          coordinates: [77.1855, 28.5244],
        },
        address: 'Mehrauli Qutub Heritage Corridor Walkway',
        locality: 'Mehrauli',
        landmark: 'Opposite Qutub Minar Parking Block B',
        reporter: citizenAshish._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
            publicId: 'broken_drain_1',
          },
        ],
        assignedDepartment: deptMap['WAT-SEW']._id,
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenAshish._id,
            byName: citizenAshish.name,
            role: 'citizen',
            note: 'Critical safety issue submitted by citizen',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 2 * 3600000),
          },
        ],
      },
      {
        title: 'Traffic Signals Stuck on Constant Red at Major Crossroad',
        description: 'Electronic traffic signal lights on all 4 arms are glitching and displaying solid red, creating complete gridlock and chaotic traffic during peak rush hour.',
        category: 'Traffic & Signals',
        status: 'Under Review',
        priority: 'High',
        location: {
          type: 'Point',
          coordinates: [77.2155, 28.6315],
        },
        address: 'Connaught Place Radial Road 3 Intersection',
        locality: 'Connaught Place',
        landmark: 'Outer Circle Crossway',
        reporter: citizenPriya._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800',
            publicId: 'traffic_light_glitch',
          },
        ],
        assignedDepartment: deptMap['TRF-TRN']._id,
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenPriya._id,
            byName: citizenPriya.name,
            role: 'citizen',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 4 * 3600000),
          },
          {
            action: 'Status changed to Under Review',
            by: adminUser._id,
            byName: adminUser.name,
            role: 'admin',
            note: 'Forwarded to Traffic Engineering Cell for urgent diagnostic',
            fromStatus: 'Submitted',
            toStatus: 'Under Review',
            timestamp: new Date(Date.now() - 3 * 3600000),
          },
        ],
      },
      {
        title: 'Fallen Banyan Tree Branch Blocking Park Pathway',
        description: 'A heavy 15-meter tree branch collapsed following yesterday night thunderstorms, completely blocking the joggers track and crushing two public benches.',
        category: 'Public Parks',
        status: 'In Progress',
        priority: 'Medium',
        location: {
          type: 'Point',
          coordinates: [77.2201, 28.5933],
        },
        address: 'Lodhi Gardens Central Jogging Loop',
        locality: 'Lodhi Estate',
        landmark: 'Near Sheesh Gumbad Monument',
        reporter: citizenRahul._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
            publicId: 'fallen_tree_1',
          },
        ],
        assignedDepartment: deptMap['PRK-REC']._id,
        assignedStaff: null,
        assignedAt: new Date(Date.now() - 20 * 3600000),
        deadline: new Date(Date.now() + 28 * 3600000),
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenRahul._id,
            byName: citizenRahul.name,
            role: 'citizen',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 24 * 3600000),
          },
          {
            action: 'Status changed to In Progress',
            by: adminUser._id,
            byName: adminUser.name,
            role: 'admin',
            note: 'Horticulture crew equipped with chain-saws deployed.',
            fromStatus: 'Submitted',
            toStatus: 'In Progress',
            timestamp: new Date(Date.now() - 12 * 3600000),
          },
        ],
      },
      {
        title: 'Repeated Drainage Clog Reopened After Heavy Rains',
        description: 'The stormwater drain that was cleared last month has clogged up again after 1 hour of rain, flooding ground floor shops with knee-deep water.',
        category: 'Drainage & Sewage',
        status: 'Reopened',
        priority: 'Critical',
        location: {
          type: 'Point',
          coordinates: [77.2088, 28.5355],
        },
        address: 'Hauz Khas Village Commercial Alley #2',
        locality: 'Hauz Khas',
        landmark: 'Behind Lake Reservoir Walk',
        reporter: citizenAshish._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
            publicId: 'drain_clog_reopen',
          },
        ],
        assignedDepartment: deptMap['WAT-SEW']._id,
        assignedStaff: staffWater._id,
        assignedAt: new Date(Date.now() - 10 * 3600000),
        deadline: new Date(Date.now() - 2 * 3600000), // Overdue for testing overdue highlighting!
        reopenReason: 'Initial repair was superficial; underground concrete conduit remains collapsed.',
        activityLogs: [
          {
            action: 'Report Submitted',
            by: citizenAshish._id,
            byName: citizenAshish.name,
            role: 'citizen',
            toStatus: 'Submitted',
            timestamp: new Date(Date.now() - 72 * 3600000),
          },
          {
            action: 'Status changed to Resolved',
            by: staffWater._id,
            byName: staffWater.name,
            role: 'staff',
            note: 'Suction machine used to pump debris.',
            fromStatus: 'Assigned',
            toStatus: 'Resolved',
            timestamp: new Date(Date.now() - 24 * 3600000),
          },
          {
            action: 'Citizen Rejected Resolution - Reopened',
            by: citizenAshish._id,
            byName: citizenAshish.name,
            role: 'citizen',
            note: 'Water clogged up immediately after light rain. Structural repair required.',
            fromStatus: 'Resolved',
            toStatus: 'Reopened',
            timestamp: new Date(Date.now() - 10 * 3600000),
          },
        ],
      },
    ]);

    console.log('[Seed] Adding community comments...');
    await Comment.create([
      {
        report: reports[0]._id,
        user: citizenPriya._id,
        content: 'I almost took a fall on my scooter here yesterday! Very thankful this has been escalated to Critical priority.',
        isOfficial: false,
      },
      {
        report: reports[0]._id,
        user: staffRoads._id,
        content: 'Official Update: The hot asphalt patching team has secured traffic cones and work will conclude tonight before 11 PM.',
        isOfficial: true,
      },
      {
        report: reports[1]._id,
        user: staffWater._id,
        content: 'Official Update: Water isolation valves for Sector B have been temporarily closed to replace the ruptured 12-inch cast pipeline.',
        isOfficial: true,
      },
      {
        report: reports[2]._id,
        user: citizenPriya._id,
        content: 'Confirming that lights are back on tonight! Walking home feels 100x safer. Thank you team!',
        isOfficial: false,
      },
    ]);

    console.log('[Seed] Setting up report follows...');
    await ReportFollow.create([
      { user: citizenAshish._id, report: reports[0]._id },
      { user: citizenPriya._id, report: reports[0]._id },
      { user: citizenAshish._id, report: reports[1]._id },
      { user: citizenRahul._id, report: reports[1]._id },
      { user: citizenPriya._id, report: reports[2]._id },
      { user: citizenAshish._id, report: reports[7]._id },
    ]);

    console.log('[Seed] Generating sample notifications...');
    await Notification.create([
      {
        recipient: citizenAshish._id,
        sender: staffRoads._id,
        report: reports[0]._id,
        title: 'Work Order In Progress',
        message: 'Roads & Infrastructure crew has arrived at Munirka Flyover Ramp to patch the pothole.',
        type: 'STATUS_UPDATE',
        isRead: false,
        link: `/reports/${reports[0]._id}`,
      },
      {
        recipient: citizenAshish._id,
        sender: adminUser._id,
        report: reports[1]._id,
        title: 'Report Assigned',
        message: 'Your report regarding high-pressure water pipeline burst has been assigned to Sunita Mehra (Water Supervisor).',
        type: 'ASSIGNMENT',
        isRead: false,
        link: `/reports/${reports[1]._id}`,
      },
      {
        recipient: citizenPriya._id,
        sender: staffElectric._id,
        report: reports[2]._id,
        title: 'Resolution Completed',
        message: 'Streetlight repair completed on Pandara Road. Please verify resolution.',
        type: 'STATUS_UPDATE',
        isRead: true,
        link: `/reports/${reports[2]._id}`,
      },
      {
        recipient: staffWater._id,
        sender: adminUser._id,
        report: reports[7]._id,
        title: 'Overdue Work Order Alert',
        message: 'Drainage Clog report in Hauz Khas has passed the SLA resolution deadline.',
        type: 'DEADLINE_WARNING',
        isRead: false,
        link: `/reports/${reports[7]._id}`,
      },
    ]);

    console.log('================================================================');
    console.log('✅ CivicTrack Database successfully populated with realistic data!');
    console.log('================================================================');
    console.log('Demo Credentials for Instant Testing:');
    console.log('👤 Citizen:           citizen@civictrack.org         | password123');
    console.log('🛡️ Administrator:     admin@civictrack.org           | password123');
    console.log('👷 Staff (Roads):     staff.roads@civictrack.org     | password123');
    console.log('👷 Staff (Water):     staff.water@civictrack.org     | password123');
    console.log('================================================================');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('Seed error:', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData };

