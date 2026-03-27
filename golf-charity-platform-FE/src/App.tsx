import { RouterProvider } from '@tanstack/react-router'
import { GolfGivesLogo } from '@/components/ui/GolfGivesLogo'
import { router } from './router'
import { useAuth } from './hooks/useAuth'
import { useAppSelector } from './hooks/useAppDispatch'

function AppShell() {
  useAuth()
  const initialized = useAppSelector((s) => s.auth.initialized)

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <GolfGivesLogo size={36} />
          <div className="w-4 h-4 border border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
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
