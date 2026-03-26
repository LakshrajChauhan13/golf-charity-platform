import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useAuth } from './hooks/useAuth'
import { useAppSelector } from './hooks/useAppDispatch'

function AppShell() {
  useAuth()
  const initialized = useAppSelector((s) => s.auth.initialized)

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">GG</span>
          </div>
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

function App() {
  return <AppShell />
}

export default App
