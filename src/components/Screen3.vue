<template>
  <div class="stats-screen">
    <h1 class="stats-title">{{ t('statistics') }}</h1>
    
    <div v-if="sortedMistakes.length > 0">
      <h2 class="section-title">{{ t('topMistakes') }}</h2>
      <div class="stats-list">
        <div 
          v-for="(item, index) in sortedMistakes" 
          :key="index"
          class="stat-item"
        >
          <span class="stat-note">
            {{ getNoteDisplayName(item.note, item.octave, item.octaveNameKey) }}
          </span>
          <span class="stat-count">{{ item.count }} {{ item.count === 1 ? t('mistake') : t('mistakes') }}</span>
        </div>
      </div>
    </div>

    <div v-else class="no-mistakes">
      <p>{{ t('noMistakes') }}</p>
    </div>

    <button class="replay-button" @click="handleReplay">
      {{ t('replay') }}
    </button>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { noteNames } from '../utils/notes.js'

export default {
  name: 'Screen3',
  props: {
    language: {
      type: String,
      default: 'en'
    },
    mistakes: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    sortedMistakes() {
      // Handle both old format (just count) and new format (object with note, octave, count)
      return Object.entries(this.mistakes)
        .map(([key, value]) => {
          if (typeof value === 'number') {
            // Old format: just count, key is note name
            return { note: key, octave: null, octaveNameKey: null, count: value }
          } else {
            // New format: object with note, octave, octaveNameKey, count
            return value
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10
    }
  },
  methods: {
    t(key) {
      return t(key, this.language)
    },
    getNoteDisplayName(note, octave, octaveNameKey) {
      const names = noteNames[this.language] || noteNames.en
      const noteIndex = noteNames.en.indexOf(note)
      const localizedNote = noteIndex !== -1 ? names[noteIndex] : note
      
      // Use octave name if available, otherwise fallback to number
      if (octaveNameKey) {
        const octaveName = t(octaveNameKey, this.language)
        return `${localizedNote} (${octaveName})`
      } else if (octave !== null) {
        return `${localizedNote}${octave}`
      } else {
        return localizedNote
      }
    },
    handleReplay() {
      this.$emit('replay')
    }
  }
}
</script>

<style scoped>
.no-mistakes {
  text-align: center;
  padding: 40px;
  font-size: 1.5rem;
  color: #28a745;
  font-weight: bold;
}
</style>

