'use client'

import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Student {
  id: number
  first_name: string
  last_name: string
  major: string
  gpa: number
  student_email: string
}

interface User {
  role: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [user, setUser] = useState<User | null>(null)

  const fetchStudents = async () => {
    const res = await axios.get(
      'http://localhost:4000/api/students',
      {
        withCredentials: true
      }
    )

    setStudents(res.data.students)
    setUser(res.data.user)
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchStudents()
  }, [])

  const deleteStudent = async (id: number) => {
    await axios.delete(
      `http://localhost:4000/api/students/${id}`,
      {
        withCredentials: true
      }
    )

    fetchStudents()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">
          Student Management
        </h1>

        {user?.role === 'admin' && (
          <Link
            href="/students/new"
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            Add Student
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-2xl font-bold mb-2">
              {student.first_name} {student.last_name}
            </h2>

            <p>{student.major}</p>
            <p>GPA: {student.gpa}</p>
            <p>{student.student_email}</p>

            {user?.role === 'admin' && (
              <div className="flex gap-3 mt-5">
                <Link
                  href={`/students/${student.id}/edit`}
                  className="text-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteStudent(student.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}