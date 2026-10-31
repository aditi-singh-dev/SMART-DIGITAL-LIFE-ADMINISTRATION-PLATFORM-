const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function seedDatabase(force = false) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0 && !force) {
    return; // Database already has data
  }

  if (force) {
    console.log('🔄 Re-seeding GharSahayak with rich, extensive Singh Family workspace...');
    db.prepare('DELETE FROM activity_logs').run();
    db.prepare('DELETE FROM reminders').run();
    db.prepare('DELETE FROM notifications').run();
    db.prepare('DELETE FROM checklist_items').run();
    db.prepare('DELETE FROM workflows').run();
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM documents').run();
    db.prepare('DELETE FROM family_members').run();
    db.prepare('DELETE FROM families').run();
    db.prepare('DELETE FROM users').run();
  } else {
    console.log('🌱 Seeding GharSahayak with rich Singh Family workspace...');
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create sample dummy doc files for download demonstration
  const sampleDocFiles = [
    'vehicle_insurance_policy.pdf',
    'passport_scan.pdf',
    'degree_marksheet.pdf',
    'aadhaar_card.pdf',
    'health_insurance_card.pdf',
    'property_sale_deed.pdf',
    'salary_slip_form16.pdf',
    'bses_electricity_bill.pdf',
    'sbi_fixed_deposit.pdf',
    'samsung_appliance_invoice.pdf'
  ];

  sampleDocFiles.forEach(file => {
    const fPath = path.join(uploadsDir, file);
    if (!fs.existsSync(fPath)) {
      fs.writeFileSync(fPath, `GharSahayak Secure Digital Life Administration Vault\n\nDocument File: ${file}\nSecurity: 256-bit AES Simulated Encryption\nAccess: Restricted to Authorized Family Members.\nStatus: Verified Record.\nIssued & Stored for: Singh Family Workspace.`);
    }
  });

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('password123', salt);

  // 1. Users
  const aditiId = uuidv4();
  const fatherId = uuidv4();
  const motherId = uuidv4();
  const brotherId = uuidv4();

  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, phone, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(aditiId, 'Aditi Singh', 'aditi@singhfamily.in', commonPassword, '+91 98765 43210', '#4F46E5');
  insertUser.run(fatherId, 'Rajesh Singh', 'father@singhfamily.in', commonPassword, '+91 98765 43211', '#2563EB');
  insertUser.run(motherId, 'Sunita Singh', 'mother@singhfamily.in', commonPassword, '+91 98765 43212', '#0D9488');
  insertUser.run(brotherId, 'Aman Singh', 'brother@singhfamily.in', commonPassword, '+91 98765 43213', '#D97706');

  // 2. Family
  const familyId = uuidv4();
  db.prepare(`
    INSERT INTO families (id, family_name, invite_code, created_by)
    VALUES (?, ?, ?, ?)
  `).run(familyId, 'Singh Family', 'SINGH-786', aditiId);

  // 3. Family Members
  const insertMember = db.prepare(`
    INSERT INTO family_members (id, family_id, user_id, role, relationship)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertMember.run(uuidv4(), familyId, aditiId, 'admin', 'Daughter (Admin)');
  insertMember.run(uuidv4(), familyId, fatherId, 'member', 'Father');
  insertMember.run(uuidv4(), familyId, motherId, 'member', 'Mother');
  insertMember.run(uuidv4(), familyId, brotherId, 'member', 'Brother');

  // Realistic dynamic dates
  const in5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in8Days = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in12Days = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in19Days = new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in27Days = new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in2Months = new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in5Months = new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in11Months = new Date(Date.now() + 330 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in2Years = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in5Years = new Date(Date.now() + 1825 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const past4Days = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const past15Days = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const past20Days = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 4. Documents (Rich Indian Family Document Suite across all 10 categories)
  const insertDoc = db.prepare(`
    INSERT INTO documents (
      id, family_id, owner_id, title, category, document_type,
      issue_date, expiry_date, issuing_authority, file_url,
      original_filename, file_size, mime_type, visibility, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const docIds = {
    vehIns: uuidv4(),
    bikeIns: uuidv4(),
    passportAditi: uuidv4(),
    passportRajesh: uuidv4(),
    marksheetDegree: uuidv4(),
    marksheet12th: uuidv4(),
    marksheet10th: uuidv4(),
    photoAditi: uuidv4(),
    admProof: uuidv4(),
    feeReceipt: uuidv4(),
    bankStmt: uuidv4(),
    fdCert: uuidv4(),
    aadhaarAditi: uuidv4(),
    aadhaarSunita: uuidv4(),
    aadhaarRajesh: uuidv4(),
    panRajesh: uuidv4(),
    panAditi: uuidv4(),
    healthIns: uuidv4(),
    termLife: uuidv4(),
    saleDeed: uuidv4(),
    electricityBill: uuidv4(),
    gasBill: uuidv4(),
    pucVeh: uuidv4(),
    rcVeh: uuidv4(),
    tvWarranty: uuidv4(),
    fridgeWarranty: uuidv4(),
    dlRajesh: uuidv4(),
    dlAditi: uuidv4()
  };

  // Vehicles
  insertDoc.run(
    docIds.vehIns, familyId, fatherId, 'Vehicle Insurance Policy (Hyundai Creta)', 'Vehicle', 'Vehicle Insurance',
    '2025-11-05', in8Days, 'ICICI Lombard General Insurance', '/uploads/vehicle_insurance_policy.pdf',
    'Hyundai_Creta_Policy_2025_26.pdf', 845000, 'application/pdf', 'family',
    'Policy No: POL-9843210. Comprehensive Bumper-to-Bumper cover with Zero Depreciation & Engine Protect.'
  );

  insertDoc.run(
    docIds.bikeIns, familyId, brotherId, 'Two-Wheeler Comprehensive Insurance (Honda Activa 6G)', 'Vehicle', 'Vehicle Insurance',
    '2025-12-01', in27Days, 'Bajaj Allianz General Insurance', '/uploads/vehicle_insurance_policy.pdf',
    'Activa_Insurance_Policy.pdf', 540000, 'application/pdf', 'family',
    'Reg No: DL-3S-CQ-8901. Includes roadside assistance.'
  );

  insertDoc.run(
    docIds.rcVeh, familyId, fatherId, 'Vehicle Registration Certificate (RC) - Creta SX', 'Vehicle', 'Registration Certificate (RC)',
    '2021-08-14', in5Years, 'Ministry of Road Transport & Highways', '/uploads/vehicle_insurance_policy.pdf',
    'Creta_RC_SmartCard.pdf', 620000, 'application/pdf', 'family',
    'Smart card scanned copy. Chassis No: MALC123456789.'
  );

  insertDoc.run(
    docIds.pucVeh, familyId, fatherId, 'Pollution Under Control (PUC) Certificate - Creta', 'Vehicle', 'Pollution Under Control (PUC)',
    '2026-05-10', in5Days, 'Delhi Transport Authorized Emission Center', '/uploads/vehicle_insurance_policy.pdf',
    'PUC_Emission_Cert_2026.pdf', 310000, 'application/pdf', 'family',
    'Petrol BS-VI emission verified. Immediate renewal due in 5 days.'
  );

  insertDoc.run(
    docIds.dlRajesh, familyId, fatherId, 'Driving License (Rajesh Singh)', 'Vehicle', 'Driving License',
    '2014-03-20', in2Years, 'RTO Janakpuri, New Delhi', '/uploads/passport_scan.pdf',
    'Rajesh_DL_Card.pdf', 420000, 'application/pdf', 'family',
    'DL No: DL-042014002341. LMV + MCWG.'
  );

  insertDoc.run(
    docIds.dlAditi, familyId, aditiId, 'Driving License (Aditi Singh)', 'Vehicle', 'Driving License',
    '2022-09-10', in5Years, 'RTO Noida, Uttar Pradesh', '/uploads/passport_scan.pdf',
    'Aditi_DL_Card.pdf', 390000, 'application/pdf', 'family',
    'LMV Non-Transport valid pan India.'
  );

  // Identity
  insertDoc.run(
    docIds.passportAditi, familyId, aditiId, 'Indian Passport (Aditi Singh)', 'Identity', 'Passport',
    '2016-04-12', in5Months, 'Regional Passport Office, Delhi', '/uploads/passport_scan.pdf',
    'Aditi_Passport_Scan.pdf', 1250000, 'application/pdf', 'family',
    'Passport booklet 36 pages. Re-issue due within next 6 months for visa validity.'
  );

  insertDoc.run(
    docIds.passportRajesh, familyId, fatherId, 'Indian Passport (Rajesh Singh)', 'Identity', 'Passport',
    '2020-02-18', in2Years, 'Regional Passport Office, Delhi', '/uploads/passport_scan.pdf',
    'Rajesh_Passport_Copy.pdf', 1100000, 'application/pdf', 'family',
    'Valid for international family travel.'
  );

  insertDoc.run(
    docIds.aadhaarAditi, familyId, aditiId, 'e-Aadhaar Card (Aditi Singh)', 'Identity', 'Aadhaar Card',
    '2018-06-10', null, 'UIDAI', '/uploads/aadhaar_card.pdf',
    'Aditi_Aadhaar_Masked.pdf', 680000, 'application/pdf', 'family',
    'VID generated. Mobile & email linked for Digilocker.'
  );

  insertDoc.run(
    docIds.aadhaarSunita, familyId, motherId, 'Aadhaar Card (Sunita Singh)', 'Identity', 'Aadhaar Card',
    '2018-02-15', null, 'UIDAI', '/uploads/aadhaar_card.pdf',
    'Sunita_Singh_Aadhaar.pdf', 520000, 'application/pdf', 'family',
    'Updated biometrics verified in 2024.'
  );

  insertDoc.run(
    docIds.aadhaarRajesh, familyId, fatherId, 'Aadhaar Card (Rajesh Singh)', 'Identity', 'Aadhaar Card',
    '2017-11-20', null, 'UIDAI', '/uploads/aadhaar_card.pdf',
    'Rajesh_Singh_Aadhaar.pdf', 610000, 'application/pdf', 'family',
    'UIDAI standard PDF.'
  );

  insertDoc.run(
    docIds.photoAditi, familyId, aditiId, 'Passport Size Photograph (Recent White BG)', 'Identity', 'Photograph',
    '2026-01-10', in11Months, 'Studio Apex Delhi', '/uploads/passport_scan.pdf',
    'Aditi_Studio_Photo_35x45.pdf', 320000, 'application/pdf', 'family',
    'Studio master photograph for admission and passport applications.'
  );

  // Education
  insertDoc.run(
    docIds.marksheetDegree, familyId, aditiId, 'B.Tech Consolidated Marksheet & Provisional Certificate', 'Education', 'Degree Certificate',
    '2024-06-20', null, 'Dr. A.P.J. Abdul Kalam Technical University', '/uploads/degree_marksheet.pdf',
    'AKTU_BTech_ComputerScience_Marksheet.pdf', 840000, 'application/pdf', 'family',
    'First Class with Distinction. CGPA: 8.84.'
  );

  insertDoc.run(
    docIds.marksheet12th, familyId, brotherId, 'Class 12th Senior Secondary Marksheet (Aman Singh)', 'Education', 'Academic Marksheet',
    '2025-05-22', null, 'Central Board of Secondary Education (CBSE)', '/uploads/degree_marksheet.pdf',
    'CBSE_Class12_Marksheet_Aman.pdf', 720000, 'application/pdf', 'family',
    'Science Stream (PCM + CS): 92.4% aggregate.'
  );

  insertDoc.run(
    docIds.marksheet10th, familyId, aditiId, 'Class 10th Passing Certificate & DoB Proof', 'Education', 'Academic Marksheet',
    '2018-05-18', null, 'CBSE New Delhi', '/uploads/degree_marksheet.pdf',
    'CBSE_10th_Certificate_Aditi.pdf', 690000, 'application/pdf', 'family',
    'Official proof of date of birth.'
  );

  insertDoc.run(
    docIds.admProof, familyId, aditiId, 'University College Admission Offer Letter', 'Education', 'Admission Proof',
    '2024-07-15', null, 'National Institute of Technology', '/uploads/degree_marksheet.pdf',
    'NIT_Counseling_Allotment_Letter.pdf', 450000, 'application/pdf', 'family',
    'Roll No: 2024CS089. Academic Session 2024-2028.'
  );

  insertDoc.run(
    docIds.feeReceipt, familyId, aditiId, 'NIT Semester Tuition & Lab Fee Receipt', 'Education', 'College / School Fee Receipt',
    '2026-01-12', null, 'NIT Cashier & Accounts Section', '/uploads/degree_marksheet.pdf',
    'NIT_Fee_Receipt_Sem4.pdf', 380000, 'application/pdf', 'family',
    'Transaction Ref: SBIN0048912384.'
  );

  // Insurance
  insertDoc.run(
    docIds.healthIns, familyId, fatherId, 'Family Health Optima Mediclaim Policy (15 Lakhs)', 'Insurance', 'Health Insurance',
    '2025-09-01', in11Months, 'Star Health & Allied Insurance', '/uploads/health_insurance_card.pdf',
    'StarHealth_FamilyFloater_2025_26.pdf', 920000, 'application/pdf', 'family',
    'Policy No: SH-9482104. Cashless hospital card covers Rajesh, Sunita, Aditi, and Aman.'
  );

  insertDoc.run(
    docIds.termLife, familyId, fatherId, 'Click2Protect 3D Plus Term Insurance (1 Crore)', 'Insurance', 'Life / Term Insurance',
    '2021-03-15', in5Years, 'HDFC Life Insurance Co Ltd', '/uploads/health_insurance_card.pdf',
    'HDFC_TermLife_Policy_1Cr.pdf', 880000, 'application/pdf', 'family',
    'Nominee: Sunita Singh (Wife). Premium paid annually in March.'
  );

  // Financial
  insertDoc.run(
    docIds.bankStmt, familyId, fatherId, 'SBI Savings Account Statement & Passbook', 'Financial', 'Bank Statement',
    '2026-01-01', null, 'State Bank of India', '/uploads/degree_marksheet.pdf',
    'SBI_JointAccount_Statement_2026.pdf', 580000, 'application/pdf', 'family',
    'Joint account with Sunita Singh for scholarship and family reimbursements.'
  );

  insertDoc.run(
    docIds.fdCert, familyId, motherId, 'HDFC Bank 5-Year Tax Saver Fixed Deposit Advice', 'Financial', 'Bank Statement',
    '2023-08-10', in2Years, 'HDFC Bank Ltd', '/uploads/sbi_fixed_deposit.pdf',
    'HDFC_FixedDeposit_Receipt.pdf', 430000, 'application/pdf', 'private',
    'Marked as Private. Maturity value: Rs. 6,80,000.'
  );

  // Property & Utilities
  insertDoc.run(
    docIds.saleDeed, familyId, fatherId, 'Residential Flat Sale Deed & Possession Letter', 'Property', 'Sale Deed / Registry',
    '2018-11-20', null, 'Sub-Registrar Office Noida', '/uploads/property_sale_deed.pdf',
    'Flat_Registry_Deed_Copy.pdf', 2400000, 'application/pdf', 'family',
    'Physical original stored in Bank of Baroda Safe Deposit Locker #214.'
  );

  insertDoc.run(
    docIds.electricityBill, familyId, fatherId, 'BSES Yamuna Domestic Electricity Bill (Paid)', 'Property', 'Electricity / Water Bill',
    '2026-02-05', in19Days, 'BSES Yamuna Power Ltd', '/uploads/bses_electricity_bill.pdf',
    'BSES_Electricity_Bill_Feb2026.pdf', 310000, 'application/pdf', 'family',
    'CA Number: 100293847. Auto-debit verified via UPI.'
  );

  // Warranty
  insertDoc.run(
    docIds.tvWarranty, familyId, fatherId, 'LG 55-inch 4K OLED Smart TV Invoice & Extended AMC', 'Warranty', 'Appliance Warranty Card',
    '2024-10-25', in2Years, 'LG Electronics India / Reliance Digital', '/uploads/samsung_appliance_invoice.pdf',
    'LG_OLED_Invoice_WarrantyCard.pdf', 510000, 'application/pdf', 'family',
    'Serial No: 410IN8934. Includes 3-year panel protection plan.'
  );

  insertDoc.run(
    docIds.fridgeWarranty, familyId, motherId, 'Samsung Digital Inverter Refrigerator Warranty Card', 'Warranty', 'Appliance Warranty Card',
    '2022-07-15', in5Years, 'Samsung India Electronics', '/uploads/samsung_appliance_invoice.pdf',
    'Samsung_Fridge_10YearCompressorWarranty.pdf', 490000, 'application/pdf', 'family',
    '10-Year compressor replacement warranty covered until 2032.'
  );

  // 5. Tasks (Diverse across all 4 family members with varied statuses and priorities)
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, family_id, title, description, assigned_to, created_by, priority, status, due_date, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTask.run(
    uuidv4(), familyId, 'Renew Vehicle Insurance for Hyundai Creta',
    'Check premium comparison on PolicyBazaar and renew before policy lapse date to retain No Claim Bonus.',
    fatherId, aditiId, 'high', 'in_progress', in8Days, null
  );

  insertTask.run(
    uuidv4(), familyId, 'College Semester Fee Payment',
    'Pay semester tuition and lab fees online through college ERP portal.',
    fatherId, aditiId, 'high', 'pending', in12Days, null
  );

  insertTask.run(
    uuidv4(), familyId, 'Apply for Tehsildar Income Certificate',
    'Visit Jan Seva Kendra or apply online at edistrict portal for updated family income certificate needed for scholarship.',
    brotherId, aditiId, 'urgent', 'pending', in8Days, null
  );

  insertTask.run(
    uuidv4(), familyId, 'Schedule Passport Re-issue Appointment',
    'Book Tatkaal slot on Passport Seva online portal before current passport reaches 6 months validity.',
    aditiId, aditiId, 'medium', 'pending', in19Days, null
  );

  insertTask.run(
    uuidv4(), familyId, 'Honda Activa 6G Annual Servicing & Oil Change',
    'Take scooter to authorized Honda service center in sector 18 for general maintenance and brake pad check.',
    brotherId, fatherId, 'medium', 'pending', in27Days, null
  );

  insertTask.run(
    uuidv4(), familyId, 'Renew Creta PUC Emission Certificate',
    'Stop by Delhi Transport petrol pump emission center to generate new 6-month PUC certificate before expiration.',
    fatherId, fatherId, 'urgent', 'pending', in5Days, null
  );

  insertTask.run(
    uuidv4(), familyId, 'Book AC Servicing before Summer Heat',
    'Schedule Urban Company technician for deep jet clean of split AC units in bedrooms.',
    motherId, motherId, 'low', 'pending', in2Months, null
  );

  insertTask.run(
    uuidv4(), familyId, 'Submit Form 16 Investment Proofs to Employer HR',
    'Upload medical insurance receipts, tuition fee receipts, and PPF deposit vouchers on company tax portal.',
    fatherId, fatherId, 'high', 'in_progress', in12Days, null
  );

  // Completed Tasks
  insertTask.run(
    uuidv4(), familyId, 'Water Bill Payment (Nagar Nigam)',
    'Pay quarterly municipal water supply bill online via UPI.',
    motherId, fatherId, 'low', 'completed', past20Days, new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString()
  );

  insertTask.run(
    uuidv4(), familyId, 'Update Nominee Details in SBI Savings Account',
    'Submitted updated nomination form (Form DA-1) at local branch counter.',
    aditiId, fatherId, 'medium', 'completed', past15Days, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  );

  insertTask.run(
    uuidv4(), familyId, 'DigiLocker Aadhaar e-KYC Verification',
    'Verified biometric mobile OTP and synced e-Aadhaar in government vault.',
    brotherId, aditiId, 'low', 'completed', past4Days, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  );

  // 6. Administrative Workflows (Detailed Indian household workflows with authentic checklists)
  const insertWf = db.prepare(`
    INSERT INTO workflows (id, family_id, title, description, category, deadline, created_by, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertChecklist = db.prepare(`
    INSERT INTO checklist_items (id, workflow_id, title, required, document_id, completed, completed_at, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const nowIso = new Date().toISOString();

  // Workflow 1: Scholarship Application (67% ready - 4 of 6 completed as per prompt example)
  const wfScholarship = uuidv4();
  insertWf.run(
    wfScholarship, familyId, 'Scholarship Application',
    'National Merit Scholarship paperwork and verification checklist for academic year 2026-27.',
    'Education', in27Days, aditiId, 'active'
  );
  insertChecklist.run(uuidv4(), wfScholarship, 'Recent Passport Size Photograph', 1, docIds.photoAditi, 1, nowIso, 0);
  insertChecklist.run(uuidv4(), wfScholarship, 'Academic Marksheet (Previous Semester)', 1, docIds.marksheetDegree, 1, nowIso, 1);
  insertChecklist.run(uuidv4(), wfScholarship, 'University Admission Proof / ID Card', 1, docIds.admProof, 1, nowIso, 2);
  insertChecklist.run(uuidv4(), wfScholarship, 'Bank Account Passbook / Cancelled Cheque', 1, docIds.bankStmt, 1, nowIso, 3);
  insertChecklist.run(uuidv4(), wfScholarship, 'Family Income Certificate (Tehsildar issued)', 1, null, 0, null, 4);
  insertChecklist.run(uuidv4(), wfScholarship, 'Required Self-declaration & Undertaking', 1, null, 0, null, 5);

  // Workflow 2: College Admission Counseling (83% ready - 5 of 6 documents ready)
  const wfCollege = uuidv4();
  insertWf.run(
    wfCollege, familyId, 'College Admission & Counseling',
    'Documentation package for undergraduate engineering university admission verification.',
    'Education', in19Days, brotherId, 'active'
  );
  insertChecklist.run(uuidv4(), wfCollege, 'Class 10th Certificate (Date of Birth Proof)', 1, docIds.marksheet10th, 1, nowIso, 0);
  insertChecklist.run(uuidv4(), wfCollege, 'Class 12th Board Marksheet', 1, docIds.marksheet12th, 1, nowIso, 1);
  insertChecklist.run(uuidv4(), wfCollege, 'Aadhaar Identity Proof', 1, docIds.aadhaarAditi, 1, nowIso, 2);
  insertChecklist.run(uuidv4(), wfCollege, 'University Seat Allotment Letter', 1, docIds.admProof, 1, nowIso, 3);
  insertChecklist.run(uuidv4(), wfCollege, 'Counseling Fee Deposit Receipt', 1, docIds.feeReceipt, 1, nowIso, 4);
  insertChecklist.run(uuidv4(), wfCollege, 'School Transfer & Migration Certificate', 1, null, 0, null, 5);

  // Workflow 3: Vehicle Insurance Renewal (50% ready)
  const wfVeh = uuidv4();
  insertWf.run(
    wfVeh, familyId, 'Vehicle Insurance Renewal',
    'Annual insurance policy renewal and inspection checklist for Hyundai Creta.',
    'Vehicle', in8Days, fatherId, 'active'
  );
  insertChecklist.run(uuidv4(), wfVeh, 'Previous Year Insurance Policy Copy', 1, docIds.vehIns, 1, nowIso, 0);
  insertChecklist.run(uuidv4(), wfVeh, 'Vehicle Registration Certificate (RC)', 1, docIds.rcVeh, 1, nowIso, 1);
  insertChecklist.run(uuidv4(), wfVeh, 'Valid PUC (Pollution Under Control) Certificate', 1, null, 0, null, 2);
  insertChecklist.run(uuidv4(), wfVeh, 'Vehicle Inspection & Odometer Photos', 0, null, 0, null, 3);

  // Workflow 4: Passport Renewal Re-issue (60% ready)
  const wfPassport = uuidv4();
  insertWf.run(
    wfPassport, familyId, 'Passport Renewal (Aditi Singh)',
    'Tatkaal re-issue documentation checklist before 6-month validity expiration.',
    'Identity', in5Months, aditiId, 'active'
  );
  insertChecklist.run(uuidv4(), wfPassport, 'Original Old Passport Copy', 1, docIds.passportAditi, 1, nowIso, 0);
  insertChecklist.run(uuidv4(), wfPassport, 'Self-attested Copy of Aadhaar Card', 1, docIds.aadhaarAditi, 1, nowIso, 1);
  insertChecklist.run(uuidv4(), wfPassport, 'Two Studio White Background Passport Photographs', 1, docIds.photoAditi, 1, nowIso, 2);
  insertChecklist.run(uuidv4(), wfPassport, 'Current Electricity Bill as Residential Address Proof', 1, null, 0, null, 3);
  insertChecklist.run(uuidv4(), wfPassport, 'Annexure E / Self Declaration Undertaking', 1, null, 0, null, 4);

  // Workflow 5: Appliance Warranty Claim (100% ready - Completed)
  const wfWarranty = uuidv4();
  insertWf.run(
    wfWarranty, familyId, 'Appliance Warranty Claim (LG OLED TV)',
    'Manufacturer warranty documentation package for complimentary screen inspection.',
    'Warranty', in2Months, fatherId, 'completed'
  );
  insertChecklist.run(uuidv4(), wfWarranty, 'Original Retail Tax Invoice', 1, docIds.tvWarranty, 1, nowIso, 0);
  insertChecklist.run(uuidv4(), wfWarranty, 'Stamped Manufacturer Warranty Card', 1, docIds.tvWarranty, 1, nowIso, 1);
  insertChecklist.run(uuidv4(), wfWarranty, 'Photo of TV Serial Number Tag', 1, docIds.tvWarranty, 1, nowIso, 2);
  insertChecklist.run(uuidv4(), wfWarranty, 'Service Job Sheet Record', 0, docIds.tvWarranty, 1, nowIso, 3);

  // 7. Notifications (Active, historical, and actionable alerts)
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, family_id, title, message, type, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  insertNotif.run(
    uuidv4(), aditiId, familyId,
    '⚠️ Vehicle Insurance expires in 8 days',
    'The policy for Hyundai Creta (ICICI Lombard) expires on ' + in8Days + '. Please complete renewal.',
    'expiry', '/vault', 0, '-10 minutes'
  );

  insertNotif.run(
    uuidv4(), aditiId, familyId,
    'Scholarship Application is 67% complete',
    '4 of 6 documents are verified in your vault. Income certificate and declaration are missing.',
    'workflow', `/workflows/${wfScholarship}`, 0, '-2 hours'
  );

  insertNotif.run(
    uuidv4(), aditiId, familyId,
    'Urgent Task: Creta PUC Renewal due in 5 days',
    'Pollution Under Control certificate expires on ' + in5Days + '. Visit nearest emission center.',
    'task', '/tasks', 0, '-5 hours'
  );

  insertNotif.run(
    uuidv4(), aditiId, familyId,
    'College Semester Fee Payment pending',
    'Task assigned to Father for tuition payment is due in 12 days.',
    'task', '/tasks', 1, '-1 day'
  );

  insertNotif.run(
    uuidv4(), aditiId, familyId,
    'Activa Two-Wheeler Insurance renewal in 27 days',
    'Bajaj Allianz motor policy renewal window is now open with early-bird discount.',
    'expiry', '/expiry', 1, '-2 days'
  );

  insertNotif.run(
    uuidv4(), aditiId, familyId,
    'DigiLocker e-KYC Verified',
    'Aman Singh completed Aadhaar biometric synchronization successfully.',
    'system', '/activity', 1, '-3 days'
  );

  // 8. Activity Logs (Extensive 2-week timeline)
  const insertLog = db.prepare(`
    INSERT INTO activity_logs (id, family_id, user_id, action, entity_type, entity_id, entity_name, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  insertLog.run(uuidv4(), familyId, aditiId, 'Uploaded document', 'document', docIds.marksheetDegree, 'B.Tech Consolidated Marksheet', 'Category: Education', '-2 hours');
  insertLog.run(uuidv4(), familyId, fatherId, 'Updated task status', 'task', null, 'Renew Vehicle Insurance for Hyundai Creta', 'Changed status to In Progress', '-4 hours');
  insertLog.run(uuidv4(), familyId, brotherId, 'Completed task', 'task', null, 'DigiLocker Aadhaar e-KYC Verification', 'Status updated to Completed', '-1 day');
  insertLog.run(uuidv4(), familyId, fatherId, 'Uploaded document', 'document', docIds.electricityBill, 'BSES Yamuna Domestic Electricity Bill', 'Category: Property', '-1 day');
  insertLog.run(uuidv4(), familyId, motherId, 'Created administrative workflow', 'workflow', wfScholarship, 'Scholarship Application', 'Added 6 mandatory requirements', '-2 days');
  insertLog.run(uuidv4(), familyId, aditiId, 'Attached document to workflow', 'workflow', wfScholarship, 'NIT College Admission Offer Letter', 'Linked to University Admission Proof requirement', '-2 days');
  insertLog.run(uuidv4(), familyId, fatherId, 'Completed task', 'task', null, 'Update Nominee Details in SBI Savings Account', 'Submitted Form DA-1 at branch', '-3 days');
  insertLog.run(uuidv4(), familyId, motherId, 'Completed task', 'task', null, 'Water Bill Payment (Nagar Nigam)', 'Quarterly municipal bill settled via UPI', '-4 days');
  insertLog.run(uuidv4(), familyId, fatherId, 'Uploaded document', 'document', docIds.saleDeed, 'Residential Flat Sale Deed & Possession Letter', 'Category: Property', '-5 days');
  insertLog.run(uuidv4(), familyId, aditiId, 'Added a new family member', 'user', brotherId, 'Aman Singh', 'Role: Member', '-6 days');
  insertLog.run(uuidv4(), familyId, fatherId, 'Uploaded document', 'document', docIds.healthIns, 'Family Health Optima Mediclaim Policy', 'Category: Insurance', '-7 days');
  insertLog.run(uuidv4(), familyId, aditiId, 'Created family workspace', 'family', familyId, 'Singh Family', 'Workspace initialized with invite code SINGH-786', '-8 days');

  console.log('✅ Extensive Singh Family workspace populated with rich documents, workflows, and tasks!');
}

module.exports = { seedDatabase };
