'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewStudentPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    student_email: '',
    major: '',
    enrollment_year: '',
    gpa: ''
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const submit = async () => {
    try {
      setLoading(true)

      await axios.post(
        'http://localhost:4000/api/students',
        {
          first_name: form.first_name,
          last_name: form.last_name,
          student_email: form.student_email,
          major: form.major,
          enrollment_year: Number(form.enrollment_year),
          gpa: Number(form.gpa)
        },
        {
          withCredentials: true
        }
      )

      router.push('/students')
    } catch (error) {
      console.error(error)
      alert('Failed to create student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-8">
          Add Student
        </h1>

        <div className="space-y-5">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-4 rounded-xl"
          />

          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-4 rounded-xl"
          />

          <input
            type="email"
            name="student_email"
            placeholder="Student Email"
            value={form.student_email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-4 rounded-xl"
          />

          <input
            type="text"
            name="major"
            placeholder="Major"
            value={form.major}
            onChange={handleChange}
            className="w-full border border-gray-300 p-4 rounded-xl"
          />

          <input
            type="number"
            name="enrollment_year"
            placeholder="Enrollment Year"
            value={form.enrollment_year}
            onChange={handleChange}
            className="w-full border border-gray-300 p-4 rounded-xl"
          />

          <input
            type="number"
            step="0.01"
            name="gpa"
            placeholder="GPA"
            value={form.gpa}
            onChange={handleChange}
            className="w-full border border-gray-300 p-4 rounded-xl"
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-black text-white p-4 rounded-xl text-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      </div>
    </div>
  )
}