import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import { SettingsProvider } from './contexts/SettingsContext'
import { AudioContextProvider } from './services/AudioContextProvider'
import { TonePlayerProvider } from './services/TonePlayerProvider'
import { PitchDetectorProvider } from './services/PitchDetectorProvider'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <AudioContextProvider>
        <TonePlayerProvider>
          <PitchDetectorProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </PitchDetectorProvider>
        </TonePlayerProvider>
      </AudioContextProvider>
    </SettingsProvider>
  </StrictMode>,
)
