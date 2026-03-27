import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <Sidebar />
      <main className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
