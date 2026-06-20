// Reusable SVG icon set. No emoji.

type Props = { className?: string; size?: number };

const baseProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

export function IconArrowRight({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function IconCheck({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconX({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconChat({ className, size = 20 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconBrain({ className, size = 20 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    </svg>
  );
}

export function IconBolt({ className, size = 20 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconWorkflow({ className, size = 20 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconLock({ className, size = 20 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconScale({ className, size = 20 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function IconTerminal({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export function IconFile({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function IconFolder({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconPlug({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M9 2v6" />
      <path d="M15 2v6" />
      <path d="M6 8h12v4a6 6 0 0 1-12 0z" />
      <path d="M12 18v4" />
    </svg>
  );
}

export function IconPackage({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function IconSearch({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconSettings({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconLogOut({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconPlus({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconSend({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function IconChevronLeft({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function IconChevronRight({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function IconLoader({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)} className={`${className ?? ""} animate-spin`}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

export function IconLogo({ className, size = 24 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 8V4H8" />
      <rect x="4" y="9" width="16" height="12" rx="2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M8 8v4" />
      <path d="M12 16v.01" />
      <path d="M12 8h4" />
      <path d="M16 8v4" />
    </svg>
  );
}

export function IconStop({ className, size = 14 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

export function IconClose({ className, size = 14 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconRead({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function IconWrite({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export function IconEdit({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  );
}

export function IconGlobe({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IconHammer({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M14 5l3 3" />
      <path d="M13 7l-9 9 4 4 9-9" />
      <path d="M5 19l-2 2" />
      <path d="M14 14l3 3" />
    </svg>
  );
}

export function IconList({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export function IconLayers({ className, size = 16 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function IconChevronDown({ className, size = 14 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function IconChevronUp({ className, size = 14 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function IconAlert({ className, size = 14 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function IconActivity({ className, size = 14 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function IconWand({ className, size = 14 }: Props) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M11 5l1.2 1.2" />
      <path d="M5 19l8-8" />
    </svg>
  );
}
