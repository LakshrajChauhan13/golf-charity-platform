import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Profile, AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  initialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
    },
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.profile = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload
    },
    signOut(state) {
      state.user = null
      state.profile = null
    },
  },
})

export const { setUser, setProfile, setLoading, setInitialized, signOut } = authSlice.actions
export default authSlice.reducer
