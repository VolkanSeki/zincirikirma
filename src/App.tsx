import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HabitsProvider } from './context/HabitsProvider.tsx'
import { Dashboard } from './components/Dashboard.tsx'
import { HabitDetail } from './components/HabitDetail.tsx'
import { NotFound } from './components/NotFound.tsx'
import { SeriesHome } from './components/SeriesHome.tsx'
import { appBasePath } from './lib/homeScreen.ts'

export default function App() {
  const basename = appBasePath() || undefined

  return (
    <HabitsProvider>
      <BrowserRouter basename={basename}>
        <div className="mx-auto min-h-dvh w-full max-w-[430px]">
          <SeriesHome />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/:slug" element={<HabitDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </HabitsProvider>
  )
}
