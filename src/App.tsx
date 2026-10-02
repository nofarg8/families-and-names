import { Navigate, Route, Routes } from 'react-router-dom'
import { HomeBar } from './components/HomeBar'
import { SpeechProvider } from './hooks/useSpeech'
import { FamilyBook } from './screens/FamilyBook'
import { Home } from './screens/Home'
import { MyStory } from './screens/MyStory'
import { NameGame } from './screens/NameGame'
import { Settings } from './screens/Settings'
import { TrueFalse } from './screens/TrueFalse'

export function App() {
  return (
    <SpeechProvider>
      <div className="app">
        <HomeBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/names" element={<NameGame />} />
          <Route path="/truefalse" element={<TrueFalse />} />
          <Route path="/story" element={<MyStory />} />
          <Route path="/book" element={<FamilyBook />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </SpeechProvider>
  )
}
