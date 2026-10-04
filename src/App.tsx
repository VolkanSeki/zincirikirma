import { HashRouter, Route, Routes } from 'react-router-dom'
import { HabitsProvider } from './context/HabitsProvider.tsx'
import { Dashboard } from './components/Dashboard.tsx'
import { HabitDetail } from './components/HabitDetail.tsx'
import { NotFound } from './components/NotFound.tsx'

export default function App() {
  return (
    <HabitsProvider>
      <HashRouter>
        <div className="mx-auto min-h-dvh w-full max-w-[430px]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/:slug" element={<HabitDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </HashRouter>
    </HabitsProvider>
  )
}
