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

export function IconCheck({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <polyline points="4 12 9 17 20 6" />
    </svg>
  )
}

export function IconBolt({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />
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

export function IconArrowRight({ className = "" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
