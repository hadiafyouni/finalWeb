import dotenv from 'dotenv';
dotenv.config();

// ── Types ───────────────────────────────────────────────────────
export interface User {
  id:       string;
  email:    string;
  password: string;      // plain text — this is a prototype, not production auth
  role:     'admin' | 'viewer';
  name:     string;
}

export interface Student {
  id:              number;
  first_name:      string;
  last_name:       string;
  student_email:   string;
  major:           string;
  enrollment_year: number;
  gpa:             number | null;
  created_at:      string;
}

export interface OTPEntry {
  code:       string;
  expires_at: number;   // Date.now() + ms
  attempts:   number;
}

// ── Hardcoded users (no DB) ─────────────────────────────────────
export const USERS: User[] = [
  {
    id:       'admin-1',
    email:    (process.env.ADMIN_EMAIL  || 'hadiafyouni9@gmail.com').toLowerCase(),
    password:  process.env.ADMIN_PASSWORD  || 'admin123',
    role:     'admin',
    name:     'Hadi (Admin)',
  },
  {
    id:       'viewer-1',
    email:    (process.env.USER_EMAIL   || 'gigeishak@gmail.com').toLowerCase(),
    password:  process.env.USER_PASSWORD   || 'user123',
    role:     'viewer',
    name:     'Viewer',
  },
];

export function findUser(email: string): User | undefined {
  return USERS.find(u => u.email === email.toLowerCase().trim());
}

// ── OTP store (in-memory, keyed by email) ──────────────────────
export const otpStore = new Map<string, OTPEntry>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpStore) {
    if (entry.expires_at < now) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000).unref();

// ── Student store (in-memory, starts with seed data) ───────────
let nextId = 16;

export const students: Student[] = [
  { id:1,  first_name:'Layla',  last_name:'Hassan',    student_email:'layla.hassan@uni.edu',    major:'Computer Science',      enrollment_year:2024, gpa:3.85, created_at: new Date().toISOString() },
  { id:2,  first_name:'Karim',  last_name:'Mansour',   student_email:'karim.mansour@uni.edu',   major:'Mechanical Engineering', enrollment_year:2024, gpa:3.42, created_at: new Date().toISOString() },
  { id:3,  first_name:'Nour',   last_name:'El Khoury', student_email:'nour.khoury@uni.edu',     major:'Architecture',          enrollment_year:2024, gpa:3.91, created_at: new Date().toISOString() },
  { id:4,  first_name:'Yousef', last_name:'Abdallah',  student_email:'yousef.abdallah@uni.edu', major:'Business Administration',enrollment_year:2023, gpa:3.12, created_at: new Date().toISOString() },
  { id:5,  first_name:'Maya',   last_name:'Saad',      student_email:'maya.saad@uni.edu',       major:'Graphic Design',        enrollment_year:2023, gpa:3.68, created_at: new Date().toISOString() },
  { id:6,  first_name:'Rami',   last_name:'Haddad',    student_email:'rami.haddad@uni.edu',     major:'Civil Engineering',     enrollment_year:2023, gpa:2.95, created_at: new Date().toISOString() },
  { id:7,  first_name:'Sara',   last_name:'Ibrahim',   student_email:'sara.ibrahim@uni.edu',    major:'Psychology',            enrollment_year:2022, gpa:3.77, created_at: new Date().toISOString() },
  { id:8,  first_name:'Hadi',   last_name:'Younes',    student_email:'hadi.younes@uni.edu',     major:'Computer Science',      enrollment_year:2022, gpa:3.50, created_at: new Date().toISOString() },
  { id:9,  first_name:'Dana',   last_name:'Fakhoury',  student_email:'dana.fakhoury@uni.edu',   major:'Biology',               enrollment_year:2022, gpa:3.88, created_at: new Date().toISOString() },
  { id:10, first_name:'Tarek',  last_name:'Najjar',    student_email:'tarek.najjar@uni.edu',    major:'Electrical Engineering',enrollment_year:2021, gpa:3.21, created_at: new Date().toISOString() },
  { id:11, first_name:'Aya',    last_name:'Sleiman',   student_email:'aya.sleiman@uni.edu',     major:'Economics',             enrollment_year:2021, gpa:3.95, created_at: new Date().toISOString() },
  { id:12, first_name:'Omar',   last_name:'Chamoun',   student_email:'omar.chamoun@uni.edu',    major:'Computer Science',      enrollment_year:2024, gpa:3.10, created_at: new Date().toISOString() },
  { id:13, first_name:'Lina',   last_name:'Bou Saab',  student_email:'lina.bousaab@uni.edu',    major:'Architecture',          enrollment_year:2024, gpa:3.55, created_at: new Date().toISOString() },
  { id:14, first_name:'Bassel', last_name:'Khalil',    student_email:'bassel.khalil@uni.edu',   major:'Business Administration',enrollment_year:2020, gpa:2.80, created_at: new Date().toISOString() },
  { id:15, first_name:'Rana',   last_name:'Asmar',     student_email:'rana.asmar@uni.edu',      major:'Psychology',            enrollment_year:2023, gpa:3.40, created_at: new Date().toISOString() },
];

export function getAllStudents(): Student[] {
  return [...students].sort((a, b) => b.id - a.id);
}

export function getStudentById(id: number): Student | undefined {
  return students.find(s => s.id === id);
}

export function addStudent(data: Omit<Student, 'id' | 'created_at'>): Student {
  const student: Student = {
    ...data,
    id: nextId++,
    created_at: new Date().toISOString(),
  };
  students.push(student);
  return student;
}

export function updateStudent(id: number, data: Partial<Omit<Student, 'id' | 'created_at'>>): Student | null {
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...data };
  return students[idx];
}

export function removeStudent(id: number): boolean {
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return false;
  students.splice(idx, 1);
  return true;
}
