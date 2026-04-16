type SupportedCapacity = 2 | 4 | 6 | 8;

interface Chair {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
}

interface TableDiagramProps {
  capacity: SupportedCapacity;
  guests: number;
  className?: string;
}

const SVG_W = 120;
const SVG_H = 120;

const TABLE_X = 30;
const TABLE_Y = 30;
const TABLE_W = SVG_W - TABLE_X * 2;
const TABLE_H = SVG_H - TABLE_Y * 2;

const CHAIR_SHORT = 12;
const CHAIR_LONG = 16;
const CHAIR_GAP = 5;
const CHAIR_RX = 3;

function buildChairs(capacity: SupportedCapacity): Chair[] {
  const chairs: Chair[] = [];

  const topBottom = capacity <= 4 ? 1 : 2;
  const leftRight =
    capacity === 2 ? 0 : capacity === 4 ? 1 : capacity === 6 ? 1 : 2;

  for (let i = 0; i < topBottom; i++) {
    const totalWidth = topBottom * CHAIR_LONG + (topBottom - 1) * 4;
    const startX = TABLE_X + (TABLE_W - totalWidth) / 2 + i * (CHAIR_LONG + 4);
    chairs.push({
      x: startX,
      y: TABLE_Y - CHAIR_GAP - CHAIR_SHORT,
      width: CHAIR_LONG,
      height: CHAIR_SHORT,
      rx: CHAIR_RX,
    });
  }

  for (let i = 0; i < leftRight; i++) {
    const totalHeight = leftRight * CHAIR_LONG + (leftRight - 1) * 4;
    const startY = TABLE_Y + (TABLE_H - totalHeight) / 2 + i * (CHAIR_LONG + 4);
    chairs.push({
      x: TABLE_X + TABLE_W + CHAIR_GAP,
      y: startY,
      width: CHAIR_SHORT,
      height: CHAIR_LONG,
      rx: CHAIR_RX,
    });
  }

  for (let i = topBottom - 1; i >= 0; i--) {
    const totalWidth = topBottom * CHAIR_LONG + (topBottom - 1) * 4;
    const startX = TABLE_X + (TABLE_W - totalWidth) / 2 + i * (CHAIR_LONG + 4);
    chairs.push({
      x: startX,
      y: TABLE_Y + TABLE_H + CHAIR_GAP,
      width: CHAIR_LONG,
      height: CHAIR_SHORT,
      rx: CHAIR_RX,
    });
  }

  for (let i = leftRight - 1; i >= 0; i--) {
    const totalHeight = leftRight * CHAIR_LONG + (leftRight - 1) * 4;
    const startY = TABLE_Y + (TABLE_H - totalHeight) / 2 + i * (CHAIR_LONG + 4);
    chairs.push({
      x: TABLE_X - CHAIR_GAP - CHAIR_SHORT,
      y: startY,
      width: CHAIR_SHORT,
      height: CHAIR_LONG,
      rx: CHAIR_RX,
    });
  }

  return chairs;
}

export default function TableDiagram({
  capacity,
  guests,
  className = "",
}: TableDiagramProps) {
  const safeCapacity: SupportedCapacity = ([2, 4, 6, 8] as const).includes(
    capacity as SupportedCapacity,
  )
    ? (capacity as SupportedCapacity)
    : 4;

  const safeGuests = Math.min(Math.max(0, guests), safeCapacity);
  const chairs = buildChairs(safeCapacity);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
      aria-label={`Table diagram: ${safeCapacity} seats, ${safeGuests} seated`}
    >
      {/* Chairs */}
      {chairs.map((c, idx) => {
        const seated = idx < safeGuests;
        return (
          <rect
            key={idx}
            x={c.x}
            y={c.y}
            width={c.width}
            height={c.height}
            rx={c.rx}
            fill={seated ? "#f97316" : "#e5e7eb"}
            stroke={seated ? "#ea580c" : "#d1d5db"}
            strokeWidth={0.75}
          />
        );
      })}

      {/* Table surface */}
      <rect
        x={TABLE_X}
        y={TABLE_Y}
        width={TABLE_W}
        height={TABLE_H}
        rx={6}
        fill="#f9fafb"
        stroke="#d1d5db"
        strokeWidth={1}
      />

      {/* Subtle wood-grain overlay */}
      <rect
        x={TABLE_X}
        y={TABLE_Y}
        width={TABLE_W}
        height={TABLE_H}
        rx={6}
        fill="url(#woodGrain)"
        opacity={0.08}
      />

      <defs>
        <pattern
          id="woodGrain"
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="4" stroke="#1a4035" strokeWidth="1" />
        </pattern>
      </defs>
    </svg>
  );
}
