import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow'

// Convert our note format to VexFlow format
export function getVexFlowNote(note) {
  const { note: noteName, octave } = note
  
  // VexFlow uses scientific pitch notation
  // Format: "C/4" means C in octave 4
  const vexNote = `${noteName}/${octave}`
  
  return vexNote
}

// Create and render a staff with a single note using VexFlow
export function renderStaffWithNote(containerElement, note, clef) {
  // Clear previous content
  containerElement.innerHTML = ''
  
  // Create a VexFlow renderer - narrower width, increased height from below
  const renderer = new Renderer(containerElement, Renderer.Backends.SVG)
  renderer.resize(150, 320) // narrower width (150px), increased height (320px) with more space below
  const ctx = renderer.getContext()
  
  // Set up the stave - narrower width, centered vertically in the renderer
  // y position: 100px from top (reduced from top, better centered with more space below for ledger lines)
  const stave = new Stave(10, 100, 130)
  stave.addClef(clef)
  stave.setContext(ctx).draw()
  
  // Create the note
  const noteName = getVexFlowNote(note)
  const staveNote = new StaveNote({
    clef: clef,
    keys: [noteName],
    duration: 'q' // quarter note
  })
  
  // Add the note to the stave
  const voice = new Voice({ num_beats: 1, beat_value: 4 })
  voice.addTickables([staveNote])
  
  const formatter = new Formatter().joinVoices([voice]).format([voice], 100)
  
  // Draw the note
  voice.draw(ctx, stave)
  
  return { renderer, ctx, stave, voice }
}
