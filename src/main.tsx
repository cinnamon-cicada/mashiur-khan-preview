import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Header from './components/Header'
import CursorGlow from './components/CursorGlow'
import Home from './pages/Home'
import Sf from './pages/Sf'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <CursorGlow />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sf" element={<Sf />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
