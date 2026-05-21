type LogoProps = {
  className?: string;
  variant?: 'full' | 'mark';
};

export function Logo({ className = '', variant = 'full' }: LogoProps) {
  if (variant === 'mark') {
    return (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Renato Sardinha">
        <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <text
          x="24" y="30"
          textAnchor="middle"
          fontFamily="Fraunces, Georgia, serif"
          fontSize="18"
          fontWeight="400"
          letterSpacing="-0.5"
          fill="currentColor"
        >
          RS
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 280 48" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Dr. Renato Sardinha">
      <text
        x="0" y="30"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="22"
        fontWeight="400"
        letterSpacing="0.5"
        fill="currentColor"
      >
        Dr. Renato Sardinha
      </text>
      <line x1="0" y1="40" x2="220" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
