interface ComponentIconProps {
  type: string;
  size?: number;
  active?: boolean;
}

export function ComponentIcon({ type, size = 32, active = false }: ComponentIconProps) {
  const color = active ? "hsl(var(--primary))" : "hsl(var(--foreground))";
  const strokeWidth = 2;

  const renderGate = () => {
    switch (type) {
      case "and":
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M8 12 H24 A12 12 0 0 1 24 36 H8 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <line x1="4" y1="18" x2="8" y2="18" stroke={color} strokeWidth={strokeWidth} />
            <line x1="4" y1="30" x2="8" y2="30" stroke={color} strokeWidth={strokeWidth} />
            <line x1="36" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case "or":
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M8 12 Q16 12 24 24 Q16 36 8 36 Q12 24 8 12" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <path d="M24 24 A18 18 0 0 1 24 24 L36 24" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <line x1="4" y1="18" x2="9" y2="18" stroke={color} strokeWidth={strokeWidth} />
            <line x1="4" y1="30" x2="9" y2="30" stroke={color} strokeWidth={strokeWidth} />
            <line x1="36" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case "not":
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M8 12 L32 24 L8 36 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <circle cx="36" cy="24" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <line x1="4" y1="24" x2="8" y2="24" stroke={color} strokeWidth={strokeWidth} />
            <line x1="39" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case "nand":
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M8 12 H22 A12 12 0 0 1 22 36 H8 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <circle cx="36" cy="24" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <line x1="4" y1="18" x2="8" y2="18" stroke={color} strokeWidth={strokeWidth} />
            <line x1="4" y1="30" x2="8" y2="30" stroke={color} strokeWidth={strokeWidth} />
            <line x1="39" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case "nor":
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M8 12 Q16 12 22 24 Q16 36 8 36 Q12 24 8 12" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <circle cx="30" cy="24" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <line x1="4" y1="18" x2="9" y2="18" stroke={color} strokeWidth={strokeWidth} />
            <line x1="4" y1="30" x2="9" y2="30" stroke={color} strokeWidth={strokeWidth} />
            <line x1="33" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case "xor":
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M6 12 Q10 24 6 36" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <path d="M10 12 Q18 12 26 24 Q18 36 10 36 Q14 24 10 12" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <line x1="4" y1="18" x2="11" y2="18" stroke={color} strokeWidth={strokeWidth} />
            <line x1="4" y1="30" x2="11" y2="30" stroke={color} strokeWidth={strokeWidth} />
            <line x1="38" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case "xnor":
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M6 12 Q10 24 6 36" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <path d="M10 12 Q18 12 24 24 Q18 36 10 36 Q14 24 10 12" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <circle cx="32" cy="24" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <line x1="4" y1="18" x2="11" y2="18" stroke={color} strokeWidth={strokeWidth} />
            <line x1="4" y1="30" x2="11" y2="30" stroke={color} strokeWidth={strokeWidth} />
            <line x1="35" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <rect x="8" y="12" width="32" height="24" stroke={color} strokeWidth={strokeWidth} rx="4" fill="none" />
            <text x="24" y="28" textAnchor="middle" fontSize="10" fill={color}>
              {type.toUpperCase()}
            </text>
          </svg>
        );
    }
  };

  if (type === "input" || type === "output") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" />
        {type === "input" && <line x1="32" y1="24" x2="44" y2="24" stroke={color} strokeWidth={strokeWidth} />}
        {type === "output" && <line x1="4" y1="24" x2="16" y2="24" stroke={color} strokeWidth={strokeWidth} />}
      </svg>
    );
  }

  if (type === "led") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" stroke={color} strokeWidth={strokeWidth} fill={active ? color : "none"} />
        <line x1="4" y1="24" x2="14" y2="24" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path
          d="M8 28 L8 20 L16 20 L16 28 L24 28 L24 20 L32 20 L32 28 L40 28 L40 20"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </svg>
    );
  }

  if (type.endsWith("ff")) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="12" y="12" width="24" height="24" stroke={color} strokeWidth={strokeWidth} rx="2" fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="10" fill={color} fontWeight="bold">
          {type.toUpperCase().replace("FF", "")}
        </text>
        <line x1="4" y1="18" x2="12" y2="18" stroke={color} strokeWidth={strokeWidth} />
        <line x1="4" y1="30" x2="12" y2="30" stroke={color} strokeWidth={strokeWidth} />
        <line x1="36" y1="18" x2="44" y2="18" stroke={color} strokeWidth={strokeWidth} />
        <line x1="36" y1="30" x2="44" y2="30" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type.includes("mux") || type.includes("demux")) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M12 8 L36 16 L36 32 L12 40 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="8" fill={color}>
          {type.toUpperCase()}
        </text>
      </svg>
    );
  }

  if (type.includes("encoder") || type.includes("decoder")) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="12" y="12" width="24" height="24" stroke={color} strokeWidth={strokeWidth} rx="2" fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="8" fill={color}>
          {type.includes("encoder") ? "ENC" : "DEC"}
        </text>
      </svg>
    );
  }

  if (type.includes("counter") || type.includes("register")) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="10" y="10" width="28" height="28" stroke={color} strokeWidth={strokeWidth} rx="2" fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="9" fill={color} fontWeight="bold">
          {type.includes("counter") ? "CTR" : "REG"}
        </text>
      </svg>
    );
  }

  // Passive components
  if (type === "resistor") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M8 24 L14 16 L20 32 L26 16 L32 32 L38 24" stroke={color} strokeWidth={strokeWidth} fill="none" />
      </svg>
    );
  }

  if (type === "capacitor") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <line x1="8" y1="24" x2="20" y2="24" stroke={color} strokeWidth={strokeWidth} />
        <line x1="20" y1="12" x2="20" y2="36" stroke={color} strokeWidth={strokeWidth} />
        <line x1="28" y1="12" x2="28" y2="36" stroke={color} strokeWidth={strokeWidth} />
        <line x1="28" y1="24" x2="40" y2="24" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "inductor") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M8 24 Q12 16 16 24 Q20 32 24 24 Q28 16 32 24 Q36 32 40 24" stroke={color} strokeWidth={strokeWidth} fill="none" />
      </svg>
    );
  }

  if (type === "diode" || type.includes("diode")) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M16 12 L32 24 L16 36 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
        <line x1="32" y1="12" x2="32" y2="36" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type.includes("transistor")) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <line x1="18" y1="12" x2="18" y2="36" stroke={color} strokeWidth={strokeWidth} />
        <line x1="18" y1="18" x2="32" y2="12" stroke={color} strokeWidth={strokeWidth} />
        <line x1="18" y1="30" x2="32" y2="36" stroke={color} strokeWidth={strokeWidth} />
        <circle cx="24" cy="24" r="12" stroke={color} strokeWidth={strokeWidth} fill="none" />
      </svg>
    );
  }

  if (type.includes("mosfet")) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <line x1="16" y1="12" x2="16" y2="36" stroke={color} strokeWidth={strokeWidth} />
        <line x1="20" y1="16" x2="32" y2="16" stroke={color} strokeWidth={strokeWidth} />
        <line x1="20" y1="24" x2="32" y2="24" stroke={color} strokeWidth={strokeWidth} />
        <line x1="20" y1="32" x2="32" y2="32" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "opamp") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M12 12 L12 36 L36 24 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
        <text x="18" y="20" fontSize="12" fill={color}>+</text>
        <text x="18" y="32" fontSize="12" fill={color}>-</text>
      </svg>
    );
  }

  if (type === "relay") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="12" y="16" width="12" height="16" stroke={color} strokeWidth={strokeWidth} fill="none" />
        <line x1="28" y1="20" x2="36" y2="24" stroke={color} strokeWidth={strokeWidth} />
        <circle cx="28" cy="20" r="2" fill={color} />
        <circle cx="36" cy="28" r="2" fill={color} />
      </svg>
    );
  }

  if (type === "battery") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <line x1="18" y1="16" x2="18" y2="32" stroke={color} strokeWidth={strokeWidth} />
        <line x1="30" y1="20" x2="30" y2="28" stroke={color} strokeWidth={strokeWidth} />
        <text x="14" y="14" fontSize="10" fill={color}>+</text>
        <text x="32" y="14" fontSize="10" fill={color}>-</text>
      </svg>
    );
  }

  if (type === "ground") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <line x1="24" y1="12" x2="24" y2="24" stroke={color} strokeWidth={strokeWidth} />
        <line x1="16" y1="24" x2="32" y2="24" stroke={color} strokeWidth={strokeWidth} />
        <line x1="20" y1="28" x2="28" y2="28" stroke={color} strokeWidth={strokeWidth} />
        <line x1="22" y1="32" x2="26" y2="32" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "switch" || type === "button") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="16" cy="24" r="3" fill={color} />
        <circle cx="32" cy="24" r="3" fill={color} />
        <line x1="16" y1="24" x2="28" y2="18" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "buzzer") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="12" stroke={color} strokeWidth={strokeWidth} fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="10" fill={color}>BZ</text>
      </svg>
    );
  }

  if (type === "lamp") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="12" stroke={color} strokeWidth={strokeWidth} fill="none" />
        <line x1="18" y1="18" x2="30" y2="30" stroke={color} strokeWidth={strokeWidth} />
        <line x1="30" y1="18" x2="18" y2="30" stroke={color} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "motor") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="12" stroke={color} strokeWidth={strokeWidth} fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="12" fill={color} fontWeight="bold">M</text>
      </svg>
    );
  }

  if (type === "display7seg") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="14" y="10" width="20" height="28" stroke={color} strokeWidth={strokeWidth} rx="2" fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="16" fill={color} fontWeight="bold">8</text>
      </svg>
    );
  }

  if (type === "ic" || type === "ic555") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="12" y="12" width="24" height="24" stroke={color} strokeWidth={strokeWidth} rx="2" fill="none" />
        <text x="24" y="28" textAnchor="middle" fontSize="10" fill={color}>IC</text>
        <circle cx="10" cy="16" r="2" fill={color} />
        <circle cx="10" cy="24" r="2" fill={color} />
        <circle cx="10" cy="32" r="2" fill={color} />
        <circle cx="38" cy="16" r="2" fill={color} />
        <circle cx="38" cy="24" r="2" fill={color} />
        <circle cx="38" cy="32" r="2" fill={color} />
      </svg>
    );
  }

  return renderGate();
}
