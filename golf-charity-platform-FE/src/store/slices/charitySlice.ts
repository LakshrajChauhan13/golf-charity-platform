import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Charity } from '@/types'

interface CharityState {
  charities: Charity[]
  loading: boolean
  error: string | null
}

const initialState: CharityState = {
  charities: [],
  loading: false,
  error: null,
}

const charitySlice = createSlice({
  name: 'charity',
  initialState,
  reducers: {
    setCharities(state, action: PayloadAction<Charity[]>) {
      state.charities = action.payload
    },
    addCharity(state, action: PayloadAction<Charity>) {
      state.charities.push(action.payload)
    },
    updateCharity(state, action: PayloadAction<Charity>) {
      const idx = state.charities.findIndex((c) => c.id === action.payload.id)
      if (idx !== -1) state.charities[idx] = action.payload
    },
    removeCharity(state, action: PayloadAction<string>) {
      state.charities = state.charities.filter((c) => c.id !== action.payload)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setCharities, addCharity, updateCharity, removeCharity, setLoading, setError } =
  charitySlice.actions
export default charitySlice.reducer
