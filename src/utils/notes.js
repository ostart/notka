// Musical note data structure
export const noteNames = {
  en: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  ru: ['До', 'Ре', 'Ми', 'Фа', 'Соль', 'Ля', 'Си']
}

// Octave definitions with their note ranges
export const octaves = {
  contra: { start: 7, end: 13 },      // C1-B1 (shifted up)
  great: { start: 14, end: 20 },      // C2-B2 (shifted up)
  small: { start: 21, end: 27 },      // C3-B3 (shifted up)
  line1: { start: 28, end: 34 },      // C4-B4 (1 line octave - correct)
  line2: { start: 35, end: 41 },      // C5-B5 (2 line octave - one octave above line1)
  line3: { start: 42, end: 48 }       // C6-B6 (3 line octave - one octave above line2)
}

// Generate all notes for selected octaves with appropriate clefs
// line1, line2, line3 → treble clef
// contra, great, small → bass clef
export function generateNotes(selectedOctaves, selectedClefs) {
  const notes = []
  
  selectedOctaves.forEach(octave => {
    const range = octaves[octave]
    if (!range) return
    
    // Determine clef based on octave type
    let clef
    if (octave === 'line1' || octave === 'line2' || octave === 'line3') {
      clef = 'treble'
    } else if (octave === 'contra' || octave === 'great' || octave === 'small') {
      clef = 'bass'
    } else {
      return // Unknown octave type
    }
    
    for (let noteIndex = range.start; noteIndex <= range.end; noteIndex++) {
      const noteName = noteNames.en[noteIndex % 7]
      const octaveNumber = Math.floor(noteIndex / 7)
      // Store the octave name key directly instead of relying on mapping
      const octaveNameKey = octave
      
      notes.push({
        id: `${noteName}${octaveNumber}-${clef}`,
        note: noteName,
        octave: octaveNumber,
        octaveNameKey: octaveNameKey, // Store the actual octave name key
        clef: clef,
        noteIndex: noteIndex,
        displayName: {
          en: noteName,
          ru: noteNames.ru[noteIndex % 7]
        }
      })
    }
  })
  
  return notes
}

// Calculate staff position for a note (0-8, where 0 is bottom line, 8 is top line)
// Each position represents a line or space on the staff
export function getStaffPosition(noteIndex, clef) {
  if (clef === 'treble') {
    // In treble clef: E4 (noteIndex 28) is on the bottom line (position 0)
    // Each semitone = 0.5 positions (line to space or space to line)
    const baseNote = 28 // E4
    const basePosition = 0 // Bottom line
    const offset = (noteIndex - baseNote) * 0.5
    return basePosition + offset
  } else { // bass clef
    // In bass clef: G2 (noteIndex 18) is on the bottom line (position 0)
    const baseNote = 18 // G2
    const basePosition = 0 // Bottom line
    const offset = (noteIndex - baseNote) * 0.5
    return basePosition + offset
  }
}

// Get note name from note index
export function getNoteName(noteIndex, language = 'en') {
  const names = noteNames[language] || noteNames.en
  const octaveNumber = Math.floor(noteIndex / 7)
  const noteName = names[noteIndex % 7]
  return `${noteName}${octaveNumber}`
}

// Map octave number to octave name key
// Note: octaveNumber is calculated as Math.floor(noteIndex / 7)
// contra: 0-6 → octaveNumber 0
// great: 7-13 → octaveNumber 1
// small: 14-20 → octaveNumber 2
// line1: 21-27 → octaveNumber 3
// line2: 28-34 → octaveNumber 4
// line3: 35-41 → octaveNumber 5
export function getOctaveNameKey(octaveNumber) {
  const mapping = {
    0: 'contra',
    1: 'great',
    2: 'small',
    3: 'line1',
    4: 'line2',
    5: 'line3'
  }
  return mapping[octaveNumber] || null
}

