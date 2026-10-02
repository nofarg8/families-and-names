let ctx: AudioContext | null = null

/** A soft three-note bell (C-E-G), synthesized so no audio file is needed. */
export function playChime() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    const now = ctx.currentTime
    const notes: [number, number][] = [
      [523.25, 0],
      [659.25, 0.11],
      [783.99, 0.22],
    ]
    for (const [freq, at] of notes) {
      for (const [type, level] of [
        ['sine', 0.16],
        ['triangle', 0.04],
      ] as const) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = type
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, now + at)
        gain.gain.linearRampToValueAtTime(level, now + at + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 1.1)
        osc.connect(gain).connect(ctx.destination)
        osc.start(now + at)
        osc.stop(now + at + 1.2)
      }
    }
  } catch {
    // Sound is a bonus; never let it break the game.
  }
}
