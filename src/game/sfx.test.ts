import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSfx } from './sfx'

/** Minimal WebAudio stub so the synth path runs under jsdom. */
class FakeParam {
  setValueAtTime() {
    return this
  }
  exponentialRampToValueAtTime() {
    return this
  }
}
class FakeOsc {
  type: OscillatorType = 'sine'
  frequency = new FakeParam()
  connect() {}
  start() {}
  stop() {}
}
class FakeGain {
  gain = new FakeParam()
  connect() {}
}
function makeFakeContextClass(
  counter: { oscillators: number },
  opts: { throwOnOsc?: boolean } = {},
) {
  return class FakeAudioContext {
    currentTime = 0
    destination = {}
    createOscillator() {
      counter.oscillators++
      if (opts.throwOnOsc) throw new Error('dead context')
      return new FakeOsc() as unknown as OscillatorNode
    }
    createGain() {
      return new FakeGain() as unknown as GainNode
    }
  }
}

function installAudioContext(Ctor: unknown) {
  ;(window as unknown as { AudioContext: unknown }).AudioContext = Ctor
}

afterEach(() => {
  // Remove the stub so the no-AudioContext tests below still see a bare env.
  delete (window as unknown as { AudioContext?: unknown }).AudioContext
  vi.restoreAllMocks()
})

describe('createSfx', () => {
  it('is a silent no-op without AudioContext (jsdom) and never throws', () => {
    const sfx = createSfx()
    expect(() => {
      sfx.play('matchBlip')
      sfx.play('missThud')
      sfx.play('solveChime')
      sfx.play('winFanfare')
    }).not.toThrow()
  })

  it('starts unmuted by default and honours the initial mute flag', () => {
    expect(createSfx().muted).toBe(false)
    expect(createSfx(true).muted).toBe(true)
  })

  it('toggles mute state via setMuted', () => {
    const sfx = createSfx()
    sfx.setMuted(true)
    expect(sfx.muted).toBe(true)
    sfx.setMuted(false)
    expect(sfx.muted).toBe(false)
  })

  it('does nothing when muted', () => {
    const sfx = createSfx(true)
    expect(() => sfx.play('winFanfare')).not.toThrow()
  })
})

describe('createSfx with a live (stubbed) AudioContext', () => {
  it('synthesizes one oscillator per note in a voice', () => {
    const counter = { oscillators: 0 }
    installAudioContext(makeFakeContextClass(counter))
    const sfx = createSfx()
    sfx.play('winFanfare') // four notes
    expect(counter.oscillators).toBe(4)
  })

  it('throttles rapid repeats of the same voice', () => {
    const counter = { oscillators: 0 }
    installAudioContext(makeFakeContextClass(counter))
    const sfx = createSfx()
    sfx.play('matchBlip') // 1 note
    sfx.play('matchBlip') // within 40ms (currentTime frozen at 0) -> skipped
    expect(counter.oscillators).toBe(1)
  })

  it('does not throttle across distinct voices', () => {
    const counter = { oscillators: 0 }
    installAudioContext(makeFakeContextClass(counter))
    const sfx = createSfx()
    sfx.play('matchBlip') // 1
    sfx.play('missThud') // 1
    expect(counter.oscillators).toBe(2)
  })

  it('stays silent while muted even with a context available', () => {
    const counter = { oscillators: 0 }
    installAudioContext(makeFakeContextClass(counter))
    const sfx = createSfx(true)
    sfx.play('solveChime')
    expect(counter.oscillators).toBe(0)
  })

  it('swallows errors from a dead context instead of throwing', () => {
    const counter = { oscillators: 0 }
    installAudioContext(makeFakeContextClass(counter, { throwOnOsc: true }))
    const sfx = createSfx()
    expect(() => sfx.play('solveChime')).not.toThrow()
  })

  it('reuses a single AudioContext across plays', () => {
    const counter = { oscillators: 0 }
    const Ctor = makeFakeContextClass(counter)
    const spy = vi.fn(() => new Ctor())
    installAudioContext(
      class extends (Ctor as ReturnType<typeof makeFakeContextClass>) {
        constructor() {
          super()
          spy()
        }
      },
    )
    const sfx = createSfx()
    sfx.play('matchBlip')
    sfx.play('missThud')
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
