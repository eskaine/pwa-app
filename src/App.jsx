import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { LocationComponent } from './LocationComponent'
import { InstallButton } from './InstallButton'
import NotificationManager from './NotificationManager'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>PWA App - iOS Compatible</h1>
        <p>Fixed Firebase messaging for iOS Safari compatibility</p>
      </div>
      <NotificationManager />
      <LocationComponent />
      <InstallButton />
    </>
  )
}

export default App
