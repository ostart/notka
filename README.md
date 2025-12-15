# Notka - Learn Musical Notes

A browser application using Vue.js for learning musical notation. This application helps you practice identifying musical notes on the staff with support for multiple octaves and clefs.

## Features

- **Three Screen Flow**: Selection → Quiz → Statistics
- **Multiple Octaves**: Contra, Major, Minor, First, Second, and Third octaves
- **Clef Support**: Treble and Bass clefs
- **Drag and Drop**: Interactive note identification with drag and drop
- **Smart Learning**: Notes are removed from study when answered correctly, kept when wrong
- **Statistics**: Track your mistakes and see which notes need more practice
- **Bilingual**: English and Russian language support
- **Responsive**: Works on both mobile and desktop devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## How to Use

1. **Screen 1 - Selection**: 
   - Select which octaves you want to study (checkboxes)
   - Select which clefs you want to practice (Treble and/or Bass)
   - Click "Go" to start

2. **Screen 2 - Quiz**:
   - A note will appear on the staff
   - Drag the note name to the correct answer box
   - Correct answers remove the note from the study set
   - Wrong answers keep the note for more practice
   - Continue until all notes are mastered

3. **Screen 3 - Statistics**:
   - View your mistakes and see which notes were most challenging
   - Click "Play Again" to start over

## Technology Stack

- Vue.js 3
- Vite
- Vanilla CSS (no frameworks)

## License

MIT
