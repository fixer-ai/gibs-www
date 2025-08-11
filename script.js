// Loads an exported SVG (from Figma) and animates layers loading sequentially.
// How to export from Figma:
// - Select the collage frame.
// - Export as SVG (Prefer "include id attribute"; flatten bitmaps optional).
// - Save as assets/collage.svg

const STAGE_ID = 'stage'
const SVG_PATH = './assets/collage.svg'
const OVERLAY_ID = 'gibs-overlay'
const SCROLL_CONTAINER_ID = 'scrolly-iphone'
const TOGGLE_BTN_ID = 'toggle-overlay-btn'

async function fetchInlineSvg(path) {
  const res = await fetch(path, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load SVG: ${res.status}`)
  return res.text()
}


function animateLayersSequentially(svgRoot) {
  const layers = svgRoot.querySelectorAll('rect[fill^="url("]')
  
  // Show layers one by one with delay
  layers.forEach((layer, index) => {
    setTimeout(() => {
      layer.style.opacity = '1'
    }, index * 200) // 200ms delay between each layer
  })

  // Return a promise that resolves after the last layer finishes its transition
  const lastIndex = layers.length - 1
  const lastLayer = layers[lastIndex]
  return new Promise(resolve => {
    if (!lastLayer) return resolve()
    const onEnd = () => {
      lastLayer.removeEventListener('transitionend', onEnd)
      resolve()
    }
    lastLayer.addEventListener('transitionend', onEnd)
  })
}

async function init() {
  const mount = document.getElementById(STAGE_ID)
  const overlay = document.getElementById(OVERLAY_ID)
  const toggleBtn = document.getElementById(TOGGLE_BTN_ID)
  if (!mount) return

  try {
    // Fetch SVG content directly
    const svgContent = await fetchInlineSvg(SVG_PATH)
    
    // Create a temporary div to parse the SVG
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = svgContent
    const svgElement = tempDiv.querySelector('svg')
    
    if (!svgElement) {
      console.error('No SVG element found')
      return
    }
    
    // Make SVG cover the viewport without letterboxing
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice')
    
    // Inject initial hiding styles directly into SVG
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = `
      rect[fill^="url("] {
        opacity: 0;
        transition: opacity 0.6s ease-in-out;
      }
    `
    svgElement.insertBefore(style, svgElement.firstChild)
    
    // Add the SVG to the mount
    mount.innerHTML = ''
    mount.appendChild(svgElement)
    
    // Start sequential animation and show overlay after it fully finishes
    setTimeout(async () => {
      await animateLayersSequentially(svgElement)
      if (overlay) overlay.classList.add('is-visible')
    }, 100)

    // Initialize scrolly-video inside the iPhone frame
    const scrollyMount = document.getElementById(SCROLL_CONTAINER_ID)
    if (scrollyMount && window.ScrollyVideo) {
      const attachScroll = (scrollyInstance) => {
        const updateProgressFromScroll = () => {
          const maxScroll = Math.max(
            1,
            (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
          )
          const y = window.scrollY || window.pageYOffset || 0
          const progress = Math.min(1, Math.max(0, y / maxScroll))
          if (typeof scrollyInstance.setVideoPercentage === 'function') {
            scrollyInstance.setVideoPercentage(progress)
          }
        }
        window.addEventListener('scroll', updateProgressFromScroll, { passive: true })
        window.addEventListener('resize', updateProgressFromScroll)
        updateProgressFromScroll()
      }

      const scrolly = new window.ScrollyVideo({
        scrollyVideoContainer: scrollyMount,
        src: './assets/gibs-Detail.mp4',
        cover: true,
        sticky: false,
        full: false,
        trackScroll: false,
        transitionSpeed: 8,
        onReady: () => attachScroll(scrolly),
      })

      // Fallback if onReady didn't fire (non-WebCodecs path)
      setTimeout(() => attachScroll(scrolly), 500)
    }

    // Default hidden: remove overlay via body class until user toggles
    document.body.classList.add('overlay-hidden')
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const hidden = document.body.classList.toggle('overlay-hidden')
        toggleBtn.setAttribute('aria-pressed', String(!hidden))
        toggleBtn.textContent = hidden ? 'Show Phone' : 'Hide Phone'
      })
    }
    
  } catch (e) {
    console.error('Failed to load SVG:', e)
    mount.innerHTML = '<p style="color: white; text-align: center; margin-top: 50px;">Failed to load collage. Please use a local server to view this properly.</p>'
  }
}

init()

