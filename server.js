const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3012;
const JWT_SECRET = 'scholar-sync-secret-2024';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ IN-MEMORY DATA STORE ============

let users = [];
let students = [];
let teachers = [];
let fees = [];
let marksheets = [];
let attendance = [];
let remarks = [];
let complaints = [];
let highlights = [];
let hostel = [];
let leaves = [];
let examSchedule = [];

let idCounter = { user: 1, student: 1, teacher: 1, fee: 1, marksheet: 1, attendance: 1, remark: 1, complaint: 1, highlight: 1, hostel: 1, leave: 1, exam: 1 };

function nextId(type) { return idCounter[type]++; }

// ============ AUTH MIDDLEWARE ============

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ============ SEED DATA ============

function seedData(schoolName) {
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Ira', 'Aanya', 'Prisha', 'Riya', 'Kavya', 'Rohan', 'Dev', 'Kabir', 'Rudra', 'Dhruv', 'Harsh', 'Yash', 'Arnav', 'Tanvi', 'Neha'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Yadav', 'Reddy', 'Joshi', 'Nair', 'Iyer', 'Desai', 'Mehta', 'Chopra', 'Malhotra', 'Bhat', 'Rao', 'Mishra', 'Pandey', 'Agarwal', 'Das', 'Chauhan', 'Sinha', 'Tiwari', 'Saxena', 'Kapoor', 'Bansal', 'Jain', 'Thakur', 'Pillai'];

  // Seed 30 students across classes 1-10
  students = [];
  for (let i = 0; i < 30; i++) {
    const classNum = (i % 10) + 1;
    const section = i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C';
    const gender = i < 20 ? (i % 2 === 0 ? 'Male' : 'Female') : (i % 2 === 0 ? 'Female' : 'Male');
    const status = i < 27 ? 'active' : 'inactive';
    students.push({
      id: nextId('student'),
      name: `${firstNames[i]} ${lastNames[i]}`,
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@student.com`,
      class: `${classNum}`,
      section,
      rollNo: `${classNum}${String(i + 1).padStart(3, '0')}`,
      gender,
      dob: `200${9 - Math.floor(classNum / 2)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      parentName: `Mr. ${lastNames[i]}`,
      parentPhone: `98${String(10000000 + i * 1111).slice(0, 8)}`,
      address: `${i + 10}, Model Town, New Delhi`,
      bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][i % 8],
      admissionDate: `2023-04-${String((i % 28) + 1).padStart(2, '0')}`,
      status,
      schoolName
    });
  }

  // Seed 10 teachers
  const teacherNames = ['Priya Menon', 'Rajesh Khanna', 'Sunita Devi', 'Anil Kapoor', 'Meera Iyer', 'Vikram Bhat', 'Neelam Joshi', 'Suresh Reddy', 'Kavita Sharma', 'Amit Tiwari'];
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Art', 'Music', 'Sanskrit'];
  teachers = [];
  for (let i = 0; i < 10; i++) {
    teachers.push({
      id: nextId('teacher'),
      name: teacherNames[i],
      email: `${teacherNames[i].split(' ')[0].toLowerCase()}@school.com`,
      subject: subjects[i],
      class: `${i + 1}`,
      phone: `99${String(10000000 + i * 2222).slice(0, 8)}`,
      qualification: ['M.Sc', 'M.A', 'B.Ed', 'M.Ed', 'Ph.D'][i % 5],
      experience: `${5 + i} years`,
      joiningDate: `20${20 - i}-07-01`,
      status: i < 9 ? 'active' : 'on-leave',
      schoolName
    });
  }

  // Seed fees data
  fees = [];
  const months = ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026'];
  students.forEach(student => {
    months.forEach((month, mi) => {
      const rand = Math.random();
      let status, paidDate;
      if (mi < 3) {
        status = rand < 0.8 ? 'paid' : 'overdue';
        paidDate = status === 'paid' ? `2026-${String(mi + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}` : null;
      } else if (mi < 5) {
        status = rand < 0.6 ? 'paid' : rand < 0.85 ? 'pending' : 'overdue';
        paidDate = status === 'paid' ? `2026-${String(mi + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}` : null;
      } else {
        status = rand < 0.3 ? 'paid' : 'pending';
        paidDate = status === 'paid' ? `2026-06-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}` : null;
      }
      fees.push({
        id: nextId('fee'),
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        month,
        amount: 2500 + parseInt(student.class) * 200,
        status,
        paidDate
      });
    });
  });

  // Seed marksheets
  marksheets = [];
  const exams = ['Midterm', 'Final'];
  const subjectsList = ['Math', 'Science', 'English', 'Hindi', 'Social Studies'];
  students.forEach(student => {
    exams.forEach(exam => {
      const subjectsObj = {};
      let total = 0;
      subjectsList.forEach(sub => {
        const marks = Math.floor(Math.random() * 40) + 60;
        subjectsObj[sub] = marks;
        total += marks;
      });
      const percentage = Math.round((total / (subjectsList.length * 100)) * 100);
      let grade;
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else grade = 'C';
      marksheets.push({
        id: nextId('marksheet'),
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        exam,
        subjects: subjectsObj,
        total,
        percentage,
        grade
      });
    });
  });

  // Seed attendance
  attendance = [];
  const statuses = ['present', 'absent', 'late'];
  students.forEach(student => {
    for (let d = 1; d <= 20; d++) {
      const dateStr = `2026-06-${String(d).padStart(2, '0')}`;
      const rand = Math.random();
      const status = rand < 0.8 ? 'present' : rand < 0.92 ? 'absent' : 'late';
      attendance.push({
        id: nextId('attendance'),
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo,
        class: student.class,
        date: dateStr,
        status
      });
    }
  });

  // Seed hostel data
  hostel = [];
  const hostelStudents = students.filter((_, i) => i % 3 === 0);
  hostelStudents.forEach((student, i) => {
    hostel.push({
      id: nextId('hostel'),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      roomNo: `${100 + Math.floor(i / 2) + 1}`,
      block: i % 2 === 0 ? 'A' : 'B',
      bedNo: `${(i % 4) + 1}`,
      floor: `${Math.floor(i / 4) + 1}`,
      messType: i % 2 === 0 ? 'Veg' : 'Non-Veg',
      status: 'occupied'
    });
  });

  // Seed complaints
  complaints = [];
  const complaintData = [
    { title: 'Broken desk in Class 5', description: 'The front desk in Class 5 has a broken leg and needs repair', studentId: 5, status: 'pending' },
    { title: 'Water cooler not working', description: 'The water cooler on the 2nd floor has not been functioning for 3 days', studentId: 8, status: 'in-progress' },
    { title: 'Bullying incident', description: 'A student has been facing bullying during lunch breaks', studentId: 12, status: 'pending' },
    { title: 'Library books missing', description: 'Several reference books are missing from the library section', studentId: 3, status: 'resolved' },
    { title: 'Bus route change request', description: 'Requesting a change in bus route to cover the new residential area', studentId: 15, status: 'pending' },
    { title: 'Canteen food quality', description: 'The food quality in the canteen has deteriorated significantly', studentId: 20, status: 'in-progress' },
  ];
  complaintData.forEach(c => {
    const student = students.find(s => s.id === c.studentId);
    complaints.push({
      id: nextId('complaint'),
      ...c,
      studentName: student ? student.name : 'Unknown',
      class: student ? student.class : '',
      createdAt: `2026-06-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
      response: c.status === 'resolved' ? 'Issue has been resolved. Thank you for reporting.' : '',
      assignedTo: 'Admin'
    });
  });

  // Seed remarks
  remarks = [];
  const remarkData = [
    { studentId: 1, type: 'positive', text: 'Excellent performance in the science fair' },
    { studentId: 2, type: 'negative', text: 'Frequently late to morning assembly' },
    { studentId: 5, type: 'positive', text: 'Outstanding leadership during sports day' },
    { studentId: 8, type: 'neutral', text: 'Needs to improve handwriting' },
    { studentId: 10, type: 'positive', text: 'Won first prize in the math olympiad' },
    { studentId: 15, type: 'negative', text: 'Incomplete homework for the third time this month' },
    { studentId: 20, type: 'positive', text: 'Volunteered for community service program' },
    { studentId: 25, type: 'neutral', text: 'Average performance, can do better with focus' },
  ];
  remarkData.forEach(r => {
    const student = students.find(s => s.id === r.studentId);
    remarks.push({
      id: nextId('remark'),
      ...r,
      studentName: student ? student.name : 'Unknown',
      class: student ? student.class : '',
      createdAt: `2026-06-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
      createdBy: 'Admin'
    });
  });

  // Seed highlights
  highlights = [];
  const highlightData = [
    { studentId: 1, title: 'Science Fair Winner', description: 'Won first place in the inter-school science fair with a project on renewable energy', category: 'Academic' },
    { studentId: 5, title: 'Sports Day Champion', description: 'Won gold medals in 100m and 200m sprint at the annual sports day', category: 'Sports' },
    { studentId: 10, title: 'Math Olympiad Gold', description: 'Secured state-level gold medal in the Mathematics Olympiad', category: 'Academic' },
    { studentId: 15, title: 'Art Exhibition', description: 'Paintings selected for the national-level art exhibition in New Delhi', category: 'Arts' },
    { studentId: 20, title: 'Debate Competition', description: 'Won the inter-school debate competition as team captain', category: 'Co-curricular' },
    { studentId: 3, title: 'Perfect Attendance', description: 'Maintained 100% attendance for two consecutive years', category: 'Discipline' },
  ];
  highlightData.forEach(h => {
    const student = students.find(s => s.id === h.studentId);
    highlights.push({
      id: nextId('highlight'),
      ...h,
      studentName: student ? student.name : 'Unknown',
      class: student ? student.class : '',
      date: `2026-06-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`
    });
  });

  // Seed leaves
  leaves = [];
  const leaveData = [
    { teacherId: 1, type: 'Sick Leave', from: '2026-06-10', to: '2026-06-12', reason: 'Fever and cold', status: 'approved' },
    { teacherId: 3, type: 'Casual Leave', from: '2026-06-15', to: '2026-06-15', reason: 'Family function', status: 'approved' },
    { teacherId: 5, type: 'Sick Leave', from: '2026-06-18', to: '2026-06-20', reason: 'Medical appointment and recovery', status: 'pending' },
    { teacherId: 7, type: 'Casual Leave', from: '2026-06-22', to: '2026-06-23', reason: 'Personal work', status: 'pending' },
    { teacherId: 10, type: 'Earned Leave', from: '2026-06-25', to: '2026-06-30', reason: 'Family vacation', status: 'approved' },
  ];
  leaveData.forEach(l => {
    const teacher = teachers.find(t => t.id === l.teacherId);
    leaves.push({
      id: nextId('leave'),
      ...l,
      teacherName: teacher ? teacher.name : 'Unknown',
      subject: teacher ? teacher.subject : '',
      appliedOn: `2026-06-${String(Math.floor(Math.random() * 10) + 1).padStart(2, '0')}`
    });
  });

  // Seed exam schedule
  examSchedule = [
    { id: nextId('exam'), exam: 'Midterm', subject: 'Mathematics', class: 'All', date: '2026-07-15', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall A' },
    { id: nextId('exam'), exam: 'Midterm', subject: 'Science', class: 'All', date: '2026-07-17', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall A' },
    { id: nextId('exam'), exam: 'Midterm', subject: 'English', class: 'All', date: '2026-07-19', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall B' },
    { id: nextId('exam'), exam: 'Midterm', subject: 'Hindi', class: 'All', date: '2026-07-21', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall B' },
    { id: nextId('exam'), exam: 'Midterm', subject: 'Social Studies', class: 'All', date: '2026-07-23', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall A' },
    { id: nextId('exam'), exam: 'Final', subject: 'Mathematics', class: 'All', date: '2026-11-10', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall A' },
    { id: nextId('exam'), exam: 'Final', subject: 'Science', class: 'All', date: '2026-11-12', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall A' },
    { id: nextId('exam'), exam: 'Final', subject: 'English', class: 'All', date: '2026-11-14', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall B' },
    { id: nextId('exam'), exam: 'Final', subject: 'Hindi', class: 'All', date: '2026-11-16', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall B' },
    { id: nextId('exam'), exam: 'Final', subject: 'Social Studies', class: 'All', date: '2026-11-18', time: '09:00 AM - 12:00 PM', venue: 'Exam Hall A' },
  ];
}

// Seed default admin and data on startup
function seedDefault() {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  users.push({
    id: nextId('user'),
    name: 'Admin',
    email: 'admin@school.com',
    password: hashedPassword,
    role: 'admin',
    schoolName: 'Demo School'
  });
  seedData('Demo School');
}

seedDefault();

// ============ AUTH ROUTES ============

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, schoolName } = req.body;
    if (!name || !email || !password || !schoolName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existing = users.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: nextId('user'),
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      schoolName
    };
    users.push(user);
    seedData(schoolName);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, schoolName: user.schoolName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, schoolName: user.schoolName } });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, schoolName: user.schoolName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, schoolName: user.schoolName } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, schoolName: user.schoolName });
});

// ============ DASHBOARD ============

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const totalStudents = students.filter(s => s.status === 'active').length;
  const totalTeachers = teachers.filter(t => t.status === 'active').length;
  const feesCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const feesTotal = fees.reduce((sum, f) => sum + f.amount, 0);

  const todayStr = '2026-06-20';
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;

  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;

  // Top performers from final exam
  const finalMarksheets = marksheets.filter(m => m.exam === 'Final').sort((a, b) => b.percentage - a.percentage).slice(0, 5);
  const topPerformers = finalMarksheets.map(m => ({
    name: m.studentName,
    class: m.class,
    percentage: m.percentage
  }));

  // Attendance trend
  const attendanceTrend = [];
  const trendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  trendMonths.forEach((month, i) => {
    const monthNum = String(i + 1).padStart(2, '0');
    const monthAttendance = attendance.filter(a => a.date.startsWith(`2026-${monthNum}`));
    const present = monthAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = monthAttendance.filter(a => a.status === 'absent').length;
    attendanceTrend.push({ month, present: present || Math.floor(Math.random() * 50) + 200, absent: absent || Math.floor(Math.random() * 20) + 10 });
  });

  res.json({
    totalStudents,
    totalTeachers,
    feesCollected,
    feesTotal,
    attendanceRate,
    pendingComplaints,
    topPerformers,
    attendanceTrend
  });
});

// ============ STUDENTS ============

app.get('/api/students', authMiddleware, (req, res) => {
  let result = [...students];
  const { class: cls, status, search } = req.query;
  if (cls) result = result.filter(s => s.class === cls);
  if (status) result = result.filter(s => s.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }
  res.json(result);
});

app.get('/api/students/:id', authMiddleware, (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const studentFees = fees.filter(f => f.studentId === student.id);
  const studentMarks = marksheets.filter(m => m.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const studentRemarks = remarks.filter(r => r.studentId === student.id);

  res.json({
    ...student,
    fees: studentFees,
    marks: studentMarks,
    attendance: studentAttendance,
    remarks: studentRemarks
  });
});

app.post('/api/students', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const student = {
    id: nextId('student'),
    ...req.body,
    status: req.body.status || 'active',
    admissionDate: req.body.admissionDate || new Date().toISOString().split('T')[0]
  };
  students.push(student);
  res.status(201).json(student);
});

app.put('/api/students/:id', authMiddleware, (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Student not found' });
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

// ============ FEES ============

app.get('/api/fees', authMiddleware, (req, res) => {
  let result = [...fees];
  const { status, month } = req.query;
  if (status) result = result.filter(f => f.status === status);
  if (month) result = result.filter(f => f.month === month);
  res.json(result);
});

app.post('/api/fees/:id/pay', authMiddleware, (req, res) => {
  const fee = fees.find(f => f.id === parseInt(req.params.id));
  if (!fee) return res.status(404).json({ error: 'Fee record not found' });
  fee.status = 'paid';
  fee.paidDate = new Date().toISOString().split('T')[0];
  res.json(fee);
});

// ============ MARKSHEETS ============

app.get('/api/marksheets', authMiddleware, (req, res) => {
  let result = [...marksheets];
  const { exam, class: cls } = req.query;
  if (exam) result = result.filter(m => m.exam === exam);
  if (cls) result = result.filter(m => m.class === cls);
  res.json(result);
});

// ============ ATTENDANCE ============

app.get('/api/attendance/mark', authMiddleware, (req, res) => {
  const { class: cls, date } = req.query;
  let result = [...attendance];
  if (cls) result = result.filter(a => a.class === cls);
  if (date) result = result.filter(a => a.date === date);

  // If no records for this class+date combo, generate from students
  if (result.length === 0 && cls && date) {
    const classStudents = students.filter(s => s.class === cls && s.status === 'active');
    result = classStudents.map(s => {
      const record = {
        id: nextId('attendance'),
        studentId: s.id,
        name: s.name,
        rollNo: s.rollNo,
        class: s.class,
        date,
        status: 'present'
      };
      attendance.push(record);
      return record;
    });
  }

  res.json(result);
});

app.post('/api/attendance/toggle', authMiddleware, (req, res) => {
  const { studentId, date, class: cls } = req.body;
  let record = attendance.find(a => a.studentId === parseInt(studentId) && a.date === date);

  if (record) {
    // Cycle: present → absent → late → present
    if (record.status === 'present') record.status = 'absent';
    else if (record.status === 'absent') record.status = 'late';
    else record.status = 'present';
    res.json(record);
  } else {
    const student = students.find(s => s.id === parseInt(studentId));
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const newRecord = {
      id: nextId('attendance'),
      studentId: student.id,
      name: student.name,
      rollNo: student.rollNo,
      class: cls || student.class,
      date,
      status: 'absent'
    };
    attendance.push(newRecord);
    res.json(newRecord);
  }
});

// ============ TEACHERS ============

app.get('/api/teachers', authMiddleware, (req, res) => {
  let result = [...teachers];
  const { class: cls, subject, status } = req.query;
  if (cls) result = result.filter(t => t.class === cls);
  if (subject) result = result.filter(t => t.subject.toLowerCase().includes(subject.toLowerCase()));
  if (status) result = result.filter(t => t.status === status);
  res.json(result);
});

// ============ REMARKS ============

app.get('/api/remarks', authMiddleware, (req, res) => {
  res.json(remarks);
});

app.post('/api/remarks', authMiddleware, (req, res) => {
  const { studentId, type, text } = req.body;
  const student = students.find(s => s.id === parseInt(studentId));
  const remark = {
    id: nextId('remark'),
    studentId: parseInt(studentId),
    studentName: student ? student.name : 'Unknown',
    class: student ? student.class : '',
    type: type || 'neutral',
    text,
    createdAt: new Date().toISOString().split('T')[0],
    createdBy: req.user.name
  };
  remarks.push(remark);
  res.status(201).json(remark);
});

// ============ COMPLAINTS ============

app.get('/api/complaints', authMiddleware, (req, res) => {
  if (req.user.role === 'admin') {
    res.json(complaints);
  } else {
    res.json(complaints.filter(c => c.assignedTo === req.user.name || c.studentId === req.user.id));
  }
});

app.post('/api/complaints', authMiddleware, (req, res) => {
  const { title, description, studentId } = req.body;
  const student = students.find(s => s.id === parseInt(studentId));
  const complaint = {
    id: nextId('complaint'),
    title,
    description,
    studentId: parseInt(studentId),
    studentName: student ? student.name : 'Unknown',
    class: student ? student.class : '',
    status: 'pending',
    response: '',
    assignedTo: 'Admin',
    createdAt: new Date().toISOString().split('T')[0]
  };
  complaints.push(complaint);
  res.status(201).json(complaint);
});

app.put('/api/complaints/:id', authMiddleware, (req, res) => {
  const complaint = complaints.find(c => c.id === parseInt(req.params.id));
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
  const { action, response, status } = req.body;
  if (status) complaint.status = status;
  if (response) complaint.response = response;
  if (action) complaint.status = action;
  res.json(complaint);
});

// ============ EXAM SCHEDULE ============

app.get('/api/exam-schedule', authMiddleware, (req, res) => {
  res.json(examSchedule);
});

// ============ HIGHLIGHTS ============

app.get('/api/highlights', authMiddleware, (req, res) => {
  res.json(highlights);
});

app.post('/api/highlights', authMiddleware, (req, res) => {
  const { studentId, title, description, category } = req.body;
  const student = students.find(s => s.id === parseInt(studentId));
  const highlight = {
    id: nextId('highlight'),
    studentId: parseInt(studentId),
    studentName: student ? student.name : 'Unknown',
    class: student ? student.class : '',
    title,
    description,
    category: category || 'General',
    date: new Date().toISOString().split('T')[0]
  };
  highlights.push(highlight);
  res.status(201).json(highlight);
});

// ============ HOSTEL ============

app.get('/api/hostel', authMiddleware, (req, res) => {
  res.json(hostel);
});

app.put('/api/hostel/:id', authMiddleware, (req, res) => {
  const room = hostel.find(h => h.id === parseInt(req.params.id));
  if (!room) return res.status(404).json({ error: 'Hostel record not found' });
  Object.assign(room, req.body);
  res.json(room);
});

// ============ LEAVES ============

app.get('/api/leaves', authMiddleware, (req, res) => {
  res.json(leaves);
});

// ============ CREDENTIALS ============

app.get('/api/credentials', (req, res) => {
  res.json([
    { role: 'Admin', email: 'admin@school.com', password: 'admin123' }
  ]);
});

// ============ HTML ROUTES ============

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Fallback: serve index.html for SPA-like navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`ScholarSync server running on http://localhost:${PORT}`);
  console.log(`Default admin login: admin@school.com / admin123`);
});
