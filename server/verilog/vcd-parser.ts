import type { WaveformData } from "@shared/schema";

export function parseVCD(vcdContent: string): WaveformData {
  const time: number[] = [];
  const signals: Record<string, (number | string)[]> = {};
  const symbolMap: Record<string, string> = {};
  
  const lines = vcdContent.split('\n');
  let currentTime = 0;
  let inHeader = true;
  
  const signalValues: Record<string, number | string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('$var')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 5) {
        const symbol = parts[3];
        const name = parts[4];
        symbolMap[symbol] = name;
        signals[name] = [];
        signalValues[name] = 0;
      }
    }
    
    else if (trimmed.startsWith('$enddefinitions')) {
      inHeader = false;
    }
    
    else if (!inHeader) {
      if (trimmed.startsWith('#')) {
        const timeValue = parseInt(trimmed.substring(1));
        if (!isNaN(timeValue)) {
          if (time.length > 0) {
            for (const name in signals) {
              signals[name].push(signalValues[name]);
            }
          }
          currentTime = timeValue;
          time.push(currentTime);
        }
      }
      
      else if (trimmed.length > 0 && !trimmed.startsWith('$')) {
        const firstChar = trimmed[0];
        
        if (firstChar === '0' || firstChar === '1' || firstChar === 'x' || firstChar === 'z') {
          const symbol = trimmed.substring(1);
          const name = symbolMap[symbol];
          if (name) {
            if (firstChar === '0' || firstChar === '1') {
              signalValues[name] = parseInt(firstChar);
            } else {
              signalValues[name] = firstChar;
            }
          }
        }
        
        else if (firstChar === 'b') {
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
            const value = parts[0].substring(1);
            const symbol = parts[1];
            const name = symbolMap[symbol];
            if (name) {
              const numValue = parseInt(value, 2);
              signalValues[name] = isNaN(numValue) ? value : numValue;
            }
          }
        }
      }
    }
  }

  if (time.length > 0) {
    for (const name in signals) {
      signals[name].push(signalValues[name]);
    }
  }

  return { time, signals };
}
