import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
