import { useEffect, useState } from "react";

export default function useElapsed(startMs: number): string {
    const [elapsed, setElapsed] = useState(() =>
        startMs ? Date.now() - startMs : 0  // ← guard here
    );

    useEffect(() => {
        if (!startMs) return; // ← skip interval if startMs not ready
        setElapsed(Date.now() - startMs);
        const id = setInterval(() => setElapsed(Date.now() - startMs), 1000);
        return () => clearInterval(id);
    }, [startMs]);

    const totalSec = Math.max(0, Math.floor(elapsed / 1000));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}