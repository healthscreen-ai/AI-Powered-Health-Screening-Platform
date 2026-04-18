import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import ImageDiagnosis from './pages/ImageDiagnosis'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import SymptomChecker from './pages/SymptomChecker'

function PlaceholderPage({ title, description }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center px-6 py-16">
      <div className="w-full rounded-[2rem] border border-sky-100 bg-white/90 p-10 shadow-[0_24px_80px_rgba(14,116,144,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
          Coming Soon
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(186,230,253,0.45),_transparent_38%),linear-gradient(180deg,_#f8fdff_0%,_#eef7ff_45%,_#f8fbff_100%)]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptom-checker"
            element={
              <ProtectedRoute>
                <SymptomChecker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image-diagnosis"
            element={
              <ProtectedRoute>
                <ImageDiagnosis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PlaceholderPage
                title="About HealthScreen AI"
                description="HealthScreen AI is designed to extend access to preliminary screening tools for rural and underserved communities."
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
