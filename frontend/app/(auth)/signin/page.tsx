'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN')
  const [loading, setLoading] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')

  const handleLogin = async () => {
    try {
      setLoading(true)
      // Note: Cloudflare Turnstile token would be attached to this payload in production
      const res = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      })

      if (res.data.requiresOTP) {
        setStep('OTP')
      }
    } catch (error) {
      console.error(error)
      alert('Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    try {
      setLoading(true)
      await axios.post(
        'http://localhost:4000/api/auth/verify-otp',
        { email, code: otp },
        { withCredentials: true }
      )
      
      router.push('/students')
    } catch (error) {
      console.error(error)
      alert('Invalid OTP code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center p-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-slate-900">
          {step === 'LOGIN' ? 'Sign In' : 'Enter OTP'}
        </h1>

        {step === 'LOGIN' ? (
          <div className="space-y-5">
            <input
              type="email"
              placeholder="Email (e.g. hadiafyouni9@gmail.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 p-4 rounded-xl"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 p-4 rounded-xl"
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-slate-600 text-center">
              We sent a 6-digit code to {email}
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-slate-300 p-4 rounded-xl text-center tracking-widest text-xl"
              maxLength={6}
            />
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}