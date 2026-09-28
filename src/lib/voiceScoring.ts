import { DartMultiplier } from '@/types/dart';

export interface ParsedVoiceCommand {
  value: number;
  multiplier: DartMultiplier;
  label: string;
  rawText: string;
}

export type VoiceState = 'unsupported' | 'idle' | 'listening' | 'processing' | 'error';

/**
 * Fuzzy parse speech text into dart throw commands
 */
export function parseSpeechToDart(text: string): ParsedVoiceCommand | null {
  const clean = text.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');

  // Miss / zero
  if (['miss', 'outside', 'bounce', 'zero', 'nothing', 'no score'].some((k) => clean.includes(k))) {
    return { value: 0, multiplier: 0, label: 'MISS', rawText: text };
  }

  // Bullseye
  if (clean.includes('double bull') || clean.includes('inner bull') || clean.includes('red bull') || clean === 'bullseye') {
    return { value: 50, multiplier: 2, label: 'BULL', rawText: text };
  }
  if (clean === 'bull' || clean.includes('bull')) {
    return { value: 50, multiplier: 2, label: 'BULL', rawText: text };
  }
  if (clean.includes('outer bull') || clean.includes('green bull') || clean.includes('single bull') || clean === 'twenty five') {
    return { value: 25, multiplier: 1, label: '25', rawText: text };
  }

  // Triple numbers: "triple twenty", "treble 19", "sixty", "t twenty"
  let mult: DartMultiplier = 1;
  let numVal: number | null = null;

  const numberWordMap: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20
  };

  const isTriple = clean.includes('triple') || clean.includes('treble') || clean.startsWith('t ');
  const isDouble = clean.includes('double') || clean.startsWith('d ');

  if (isTriple) mult = 3;
  else if (isDouble) mult = 2;

  // Extract number
  // First look for digits 1-20
  const digitMatch = clean.match(/\b([1-9]|1[0-9]|20)\b/);
  if (digitMatch) {
    numVal = parseInt(digitMatch[1], 10);
  } else {
    // Look for words
    for (const [word, val] of Object.entries(numberWordMap)) {
      if (new RegExp(`\\b${word}\\b`).test(clean)) {
        numVal = val;
        break;
      }
    }
  }

  // Common shorthand callouts
  if (!numVal) {
    if (clean.includes('sixty') || clean === '60') {
      return { value: 20, multiplier: 3, label: 'T20', rawText: text };
    }
    if (clean.includes('tops') || clean === 'top') {
      return { value: 20, multiplier: 2, label: 'D20', rawText: text };
    }
    if (clean.includes('fifty seven') || clean === '57') {
      return { value: 19, multiplier: 3, label: 'T19', rawText: text };
    }
    if (clean.includes('fifty four') || clean === '54') {
      return { value: 18, multiplier: 3, label: 'T18', rawText: text };
    }
  }

  if (numVal !== null && numVal >= 1 && numVal <= 20) {
    let label = `${numVal}`;
    if (mult === 3) label = `T${numVal}`;
    else if (mult === 2) label = `D${numVal}`;
    return { value: numVal, multiplier: mult, label, rawText: text };
  }

  return null;
}

export class VoiceRecognitionController {
  private recognition: any = null;
  private onResultCallback: ((cmd: ParsedVoiceCommand) => void) | null = null;
  private onStateChangeCallback: ((state: VoiceState, msg?: string) => void) | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStateChangeCallback?.('listening');
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            // Restart if continuous listening desired
            try {
              this.recognition.start();
            } catch {
              this.isListening = false;
              this.onStateChangeCallback?.('idle');
            }
          } else {
            this.onStateChangeCallback?.('idle');
          }
        };

        this.recognition.onerror = (e: any) => {
          this.onStateChangeCallback?.('error', e.error);
        };

        this.recognition.onresult = (event: any) => {
          const lastIdx = event.results.length - 1;
          const transcript = event.results[lastIdx][0].transcript;
          const parsed = parseSpeechToDart(transcript);
          if (parsed && this.onResultCallback) {
            this.onResultCallback(parsed);
          }
        };
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(
    onResult: (cmd: ParsedVoiceCommand) => void,
    onState: (state: VoiceState, msg?: string) => void
  ) {
    if (!this.recognition) {
      onState('unsupported');
      return;
    }
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onState;
    try {
      this.isListening = true;
      this.recognition.start();
    } catch {
      // might already be started
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.onStateChangeCallback?.('idle');
  }
}
