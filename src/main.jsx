import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SettingsProvider } from './contexts/SettingsContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
