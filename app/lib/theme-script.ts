export function themeInitScript() {
  return `
    ;(function() {
      try {
        let stored = localStorage.getItem('darkMode')
        if (stored !== null) {
          document.documentElement.classList.toggle('dark', stored === 'true')
        } else {
          let systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          document.documentElement.classList.toggle('dark', systemDark)
        }
      } catch (e) {
        console.error('Failed to initialize theme:', e)
      }
    })()
  `
} 