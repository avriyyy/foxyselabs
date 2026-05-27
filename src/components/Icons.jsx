const s = { stroke: "currentColor", fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }

export function IconLayout({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export function IconNetwork({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="8" y="14" width="8" height="8" rx="1" />
      <line x1="6" y1="10" x2="10" y2="14" />
      <line x1="18" y1="10" x2="14" y2="14" />
    </svg>
  )
}

export function IconDevices({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <rect x="2" y="5" width="12" height="14" rx="2" />
      <rect x="15" y="7" width="7" height="12" rx="1" />
      <line x1="8" y1="19" x2="8" y2="21" />
      <line x1="6" y1="21" x2="10" y2="21" />
    </svg>
  )
}



export function IconX({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  )
}

export function IconScanEye({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="1" />
      <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />
    </svg>
  )
}

export function IconChartColumn({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}

export function IconRocket({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09" />
      <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05" />
    </svg>
  )
}

export function IconCheck({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconCross({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function IconClock({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconBell({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export function IconChartLine({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <polyline points="7 15 11 11 15 14 21 7" />
      <polyline points="21 10 21 7 18 7" />
    </svg>
  )
}

export function IconWallet({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12h2" />
      <circle cx="18" cy="12" r="1" />
      <path d="M2 9h20" />
    </svg>
  )
}

export function IconSettings({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function IconChevronLeft({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function IconChevronRight({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function IconCalculator({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10.01" />
      <line x1="12" y1="10" x2="12" y2="10.01" />
      <line x1="16" y1="10" x2="16" y2="10.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  )
}

export function IconArrowRight({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
