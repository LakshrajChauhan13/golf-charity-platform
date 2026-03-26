import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Draw, Winner } from '@/types'

interface DrawState {
  draws: Draw[]
  currentDraw: Draw | null
  winners: Winner[]
  loading: boolean
  error: string | null
}

const initialState: DrawState = {
  draws: [],
  currentDraw: null,
  winners: [],
  loading: false,
  error: null,
}

const drawSlice = createSlice({
  name: 'draw',
  initialState,
  reducers: {
    setDraws(state, action: PayloadAction<Draw[]>) {
      state.draws = action.payload
    },
    setCurrentDraw(state, action: PayloadAction<Draw | null>) {
      state.currentDraw = action.payload
    },
    updateDraw(state, action: PayloadAction<Draw>) {
      const idx = state.draws.findIndex((d) => d.id === action.payload.id)
      if (idx !== -1) state.draws[idx] = action.payload
      if (state.currentDraw?.id === action.payload.id) state.currentDraw = action.payload
    },
    setWinners(state, action: PayloadAction<Winner[]>) {
      state.winners = action.payload
    },
    updateWinner(state, action: PayloadAction<Winner>) {
      const idx = state.winners.findIndex((w) => w.id === action.payload.id)
      if (idx !== -1) state.winners[idx] = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setDraws, setCurrentDraw, updateDraw, setWinners, updateWinner, setLoading, setError } =
  drawSlice.actions
export default drawSlice.reducer
