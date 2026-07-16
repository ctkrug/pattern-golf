/**
 * WebAudio-synthesized sound effects — zero binary assets. Every tone is
 * generated from oscillators in code. The AudioContext is created lazily on
 * the first play (autoplay policy: must follow a user gesture) and every call
 * is guarded so environments without AudioContext (tests, some webviews) are
 * silent no-ops rather than errors.
 */
export type SfxName = 'matchBlip' | 'missThud' | 'solveChime' | 'winFanfare'

export interface Sfx {
  play(name: SfxName): void
  setMuted(muted: boolean): void
  readonly muted: boolean
}

interface Note {
  freq: number
  /** Start offset from now, seconds. */
  at: number
  /** Duration, seconds. */
  dur: number
  type: OscillatorType
  gain: number
}

const VOICES: Record<SfxName, Note[]> = {
  // Short rising sine per matched cell.
  matchBlip: [{ freq: 660, at: 0, dur: 0.09, type: 'sine', gain: 0.16 }],
  // Short descending square per wrongly-matched cell.
  missThud: [{ freq: 180, at: 0, dur: 0.1, type: 'square', gain: 0.12 }],
  // Three-note ascending arpeggio on solve.
  solveChime: [
    { freq: 523, at: 0, dur: 0.12, type: 'sine', gain: 0.18 },
    { freq: 659, at: 0.1, dur: 0.12, type: 'sine', gain: 0.18 },
    { freq: 784, at: 0.2, dur: 0.16, type: 'sine', gain: 0.18 },
  ],
  // Four-note major arpeggio with decay for the win overlay.
  winFanfare: [
    { freq: 523, at: 0, dur: 0.14, type: 'triangle', gain: 0.2 },
    { freq: 659, at: 0.12, dur: 0.14, type: 'triangle', gain: 0.2 },
    { freq: 784, at: 0.24, dur: 0.14, type: 'triangle', gain: 0.2 },
    { freq: 1047, at: 0.36, dur: 0.3, type: 'triangle', gain: 0.22 },
  ],
}

type AudioContextCtor = typeof AudioContext

function audioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    AudioContext?: AudioContextCtor
    webkitAudioContext?: AudioContextCtor
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

export function createSfx(initialMuted = false): Sfx {
  let ctx: AudioContext | null = null
  let muted = initialMuted
  // Throttle rapid repeats of the same voice (the flip cascade fires many).
  const lastPlayed: Partial<Record<SfxName, number>> = {}

  function ensureContext(): AudioContext | null {
    if (ctx) return ctx
    const Ctor = audioContextCtor()
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      ctx = null
    }
    return ctx
  }

  function playNote(context: AudioContext, note: Note, start: number): void {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = note.type
    osc.frequency.setValueAtTime(note.freq, start + note.at)
    // Quick attack, exponential release for a plucky, non-buzzy tone.
    gain.gain.setValueAtTime(0.0001, start + note.at)
    gain.gain.exponentialRampToValueAtTime(note.gain, start + note.at + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.at + note.dur)
    osc.connect(gain)
    gain.connect(context.destination)
    osc.start(start + note.at)
    osc.stop(start + note.at + note.dur + 0.02)
  }

  return {
    get muted() {
      return muted
    },
    setMuted(next: boolean) {
      muted = next
    },
    play(name: SfxName) {
      if (muted) return
      const context = ensureContext()
      if (!context) return
      const now = context.currentTime
      // Rate-throttle: skip if this voice played within 40ms.
      if (lastPlayed[name] !== undefined && now - lastPlayed[name]! < 0.04) {
        return
      }
      lastPlayed[name] = now
      try {
        for (const note of VOICES[name]) playNote(context, note, now)
      } catch {
        // A dead/closed context should never bubble up as a crash.
      }
    },
  }
}
