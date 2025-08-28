import { useState, useEffect } from 'react'

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [debugInfo, setDebugInfo] = useState('Waiting for beforeinstallprompt...')

  useEffect(() => {
    const handler = (e) => {
      console.log('beforeinstallprompt fired!', e)
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
      setDebugInfo('Install prompt available!')
    }

    const installedHandler = () => {
      console.log('App installed!')
      setShowInstall(false)
      setDeferredPrompt(null)
      setDebugInfo('App installed')
    }

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setDebugInfo('App already installed')
    } else if (navigator.standalone) {
      setDebugInfo('App already installed (iOS)')
    } else {
      setDebugInfo('Waiting for beforeinstallprompt...')
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    
    setDeferredPrompt(null)
  }

  return (
    <div style={{ marginBottom: '10px' }}>
      <span style={{ color: showInstall ? 'green' : 'orange' }}>
        📱 PWA Install: {debugInfo}
      </span>
      {showInstall && (
        <button 
          onClick={handleInstall}
          style={{ marginLeft: '10px', padding: '5px 10px' }}
        >
          Install App
        </button>
      )}
    </div>
  )
}