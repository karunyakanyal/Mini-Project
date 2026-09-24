import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import ComparePage from './pages/ComparePage.jsx'
import DuplicateFinder from './pages/DuplicateFinder.jsx'
import DatasetAnalyzer from './pages/DatasetAnalyzer.jsx'
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import AboutPage from './pages/AboutPage.jsx'

export default function App() {
  return <BrowserRouter><Routes><Route element={<AppLayout />}>
    <Route index element={<Navigate to="/compare" replace />} />
    <Route path="compare" element={<ComparePage />} />
    <Route path="finder" element={<DuplicateFinder />} />
    <Route path="dataset" element={<DatasetAnalyzer />} />
    <Route path="how-it-works" element={<HowItWorksPage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="*" element={<Navigate to="/compare" replace />} />
  </Route></Routes></BrowserRouter>
}
