export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="40"
        viewBox="0 0 39.27 43.07"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <filter id="outline" x="-50%" y="-50%" width="200%" height="200%">
            <feMorphology operator="dilate" in="SourceAlpha" radius="1" result="dilated" />
            <feFlood floodColor="black" floodOpacity="1" result="black" />
            <feComposite operator="in" in="black" in2="dilated" result="outline" />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#outline)" strokeLinecap="round">
          <g transform="translate(28.55 11.82) rotate(0 -5.94 5.07)">
            <path
              d="M0.52 -0.1 C-1.57 0.82, -12.2 3.34, -12.39 5.15 C-12.58 6.96, -2.46 9.87, -0.63 10.76 M0.12 -0.63 C-1.82 0.42, -11.24 4.14, -11.4 5.88 C-11.57 7.63, -2.49 8.99, -0.85 9.85"
              stroke="#db2777"
              strokeWidth="2"
              fill="none"
            />
          </g>
          <g transform="translate(10.19 9.96) rotate(0 9.45 0.52)">
            <path
              d="M-0.19 0.34 C2.92 0.33, 15.96 0.25, 19.08 0.25 M0.72 0.04 C3.76 0.11, 16.01 1.1, 18.92 0.99"
              stroke="#db2777"
              strokeWidth="2"
              fill="none"
            />
          </g>
          <g transform="translate(10.72 23.44) rotate(0 8.38 -0.38)">
            <path
              d="M-0.32 -0.18 C2.6 -0.2, 14.25 -0.42, 17.07 -0.48 M0.52 -0.74 C3.43 -0.69, 14.23 -0.11, 16.86 -0.02"
              stroke="#db2777"
              strokeWidth="2"
              fill="none"
            />
          </g>
          <g transform="translate(10.51 23.34) rotate(0 4.1 4.96)">
            <path
              d="M0.25 0.32 C1.53 0.9, 6.25 1.63, 7.54 3.2 C8.84 4.77, 7.94 8.65, 8.03 9.73 M-0.06 0.18 C1.2 0.68, 5.96 1.17, 7.29 2.67 C8.63 4.17, 7.97 8.11, 7.96 9.17"
              stroke="#db2777"
              strokeWidth="2"
              fill="none"
            />
          </g>
          <g transform="translate(9.9 19.56) rotate(78.24 5.79 -3.6)">
            <path
              d="M0.2 -0.43 C1.54 -2.17, 6.23 -10.5, 8.18 -9.97 C10.14 -9.43, 11.31 0.76, 11.94 2.79 M-0.36 0.55 C1.13 -0.9, 7.13 -9.66, 9.15 -9.43 C11.16 -9.2, 11.22 -0.08, 11.73 1.93"
              stroke="#db2777"
              strokeWidth="2"
              fill="none"
            />
          </g>
        </g>
      </svg>
      <span className="text-2xl leading-none tracking-tight">
        <span className="text-black">Foxyse</span>
        <span className="text-brand">Labs</span>
        <span className="text-black">.</span>
      </span>
    </span>
  );
}
