<template>
  <div class="selection-screen">
    <h1 class="screen-title">{{ t('title') }}</h1>
    
    <div class="octave-section">
      <h2 class="section-title">{{ t('selectOctaves') }}</h2>
      <div class="checkbox-group">
        <div 
          v-for="octave in octaves" 
          :key="octave.key"
          class="checkbox-item"
        >
          <input 
            type="checkbox" 
            :id="octave.key"
            :checked="selectedOctaves.includes(octave.key)"
            @change="handleCheckboxChange(octave.key, $event)"
          />
          <label :for="octave.key">{{ octave.label }}</label>
        </div>
      </div>
    </div>

    <button 
      class="go-button"
      :disabled="!canStart"
      @click="startGame"
    >
      {{ t('go') }}
    </button>
  </div>
</template>

<script>
import { t } from '../i18n.js'

export default {
  name: 'Screen1',
  props: {
    language: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return {
      selectedOctaves: ['contra', 'great', 'small', 'line1', 'line2', 'line3'], // All octaves selected by default
      octaves: [
        { key: 'contra', label: 'Contra Octave' },
        { key: 'great', label: 'Great Octave' },
        { key: 'small', label: 'Small Octave' },
        { key: 'line1', label: '1 Line Octave' },
        { key: 'line2', label: '2 Line Octave' },
        { key: 'line3', label: '3 Line Octave' }
      ]
    }
  },
  computed: {
    canStart() {
      return this.selectedOctaves.length > 0
    },
    // Automatically determine clefs based on selected octaves
    selectedClefs() {
      const clefs = new Set()
      // Treble Clef for: line1, line2, line3
      if (this.selectedOctaves.includes('line1') || 
          this.selectedOctaves.includes('line2') || 
          this.selectedOctaves.includes('line3')) {
        clefs.add('treble')
      }
      // Bass Clef for: contra, great, small
      if (this.selectedOctaves.includes('contra') || 
          this.selectedOctaves.includes('great') || 
          this.selectedOctaves.includes('small')) {
        clefs.add('bass')
      }
      return Array.from(clefs)
    }
  },
  watch: {
    language() {
      this.updateLabels()
    }
  },
  mounted() {
    this.updateLabels()
  },
  methods: {
    t(key) {
      return t(key, this.language)
    },
    updateLabels() {
      this.octaves = [
        { key: 'contra', label: t('contra', this.language) },
        { key: 'great', label: t('great', this.language) },
        { key: 'small', label: t('small', this.language) },
        { key: 'line1', label: t('line1', this.language) },
        { key: 'line2', label: t('line2', this.language) },
        { key: 'line3', label: t('line3', this.language) }
      ]
    },
    handleCheckboxChange(octave, event) {
      // Use the checkbox's checked state to determine the action
      if (event.target.checked) {
        if (!this.selectedOctaves.includes(octave)) {
          this.selectedOctaves.push(octave)
        }
      } else {
        const index = this.selectedOctaves.indexOf(octave)
        if (index > -1) {
          this.selectedOctaves.splice(index, 1)
        }
      }
    },
    toggleOctave(octave) {
      const index = this.selectedOctaves.indexOf(octave)
      if (index > -1) {
        this.selectedOctaves.splice(index, 1)
      } else {
        this.selectedOctaves.push(octave)
      }
    },
    startGame() {
      if (this.canStart) {
        // Automatically determine clefs based on selected octaves
        this.$emit('start-game', [...this.selectedOctaves], [...this.selectedClefs])
      }
    }
  }
}
</script>

