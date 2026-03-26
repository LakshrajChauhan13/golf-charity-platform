import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { store } from '@/store'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { ScoresPage } from '@/pages/dashboard/ScoresPage'
import { CharityPage } from '@/pages/dashboard/CharityPage'
import { DrawPage } from '@/pages/dashboard/DrawPage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'
import { AdminOverview } from '@/pages/admin/AdminOverview'
import { AdminDrawControl } from '@/pages/admin/AdminDrawControl'
import { AdminCharityCMS } from '@/pages/admin/AdminCharityCMS'
import { AdminWinnerVerification } from '@/pages/admin/AdminWinnerVerification'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { SubscriptionSuccessPage } from '@/pages/SubscriptionSuccessPage'

function requireAuth() {
  const state = store.getState()
  if (state.auth.initialized && !state.auth.user) {
    throw redirect({ to: '/login' })
  }
}

function requireAdmin() {
  const state = store.getState()
  if (state.auth.initialized && !state.auth.profile?.is_admin) {
    throw redirect({ to: '/dashboard' })
  }
}

const rootRoute = createRootRoute({ component: Outlet })

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
  beforeLoad: requireAuth,
})

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/',
  component: DashboardHome,
})

const scoresRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/scores',
  component: ScoresPage,
})

const charityRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/charity',
  component: CharityPage,
})

const drawRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/draw',
  component: DrawPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/settings',
  component: SettingsPage,
})

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
  beforeLoad: () => { requireAuth(); requireAdmin() },
})

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  component: AdminOverview,
})

const adminDrawsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/draws',
  component: AdminDrawControl,
})

const adminCharitiesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/charities',
  component: AdminCharityCMS,
})

const adminWinnersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/winners',
  component: AdminWinnerVerification,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users',
  component: AdminUsers,
})

const subscriptionSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subscription/success',
  component: SubscriptionSuccessPage,
})

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  subscriptionSuccessRoute,
  dashboardLayoutRoute.addChildren([
    dashboardIndexRoute,
    scoresRoute,
    charityRoute,
    drawRoute,
    settingsRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminDrawsRoute,
    adminCharitiesRoute,
    adminWinnersRoute,
    adminUsersRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
