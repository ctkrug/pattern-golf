import { describe, expect, it } from 'vitest'
import { createSfx } from './sfx'

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
