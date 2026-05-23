import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
      <div className="max-w-3xl text-center space-y-8">
        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          v1.0 Secure Portal
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Student Management System
        </h1>
        
        <p className="text-xl text-slate-600 leading-relaxed">
          A centralized, secure platform for administrators and viewers to manage academic records, enrollments, and student data.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Link
            href="/students"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Browse Students
          </Link>
          <Link
            href="/login"
            className="bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold border border-slate-200 hover:bg-slate-50 transition shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}