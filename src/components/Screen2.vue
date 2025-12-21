<template>
  <div class="quiz-screen">
    <h2 class="screen-title">{{ t('quizTitle') }}</h2>
    
    <div v-if="studyDictionary.length > 0 || currentNote" class="progress-info">
      {{ t('progress').replace('{count}', remainingNotes) }}
    </div>
    <div v-else class="progress-info">
      {{ language === 'en' ? 'Initializing game...' : 'Инициализация игры...' }}
    </div>

    <div class="quiz-layout">
      <!-- Left side answers (2 options) -->
      <div class="answers-left">
        <div
          v-for="(option, index) in leftOptions"
          :key="'left-' + index"
          class="response-option"
          :class="{
            'drag-over': dragOverIndex === getOptionIndex('left', index),
            'correct': option.correct && (showFeedback || showCorrectAnswer),
            'incorrect': option.incorrect && showFeedback
          }"
          draggable="true"
          @dragstart="handleAnswerDragStart(getOptionIndex('left', index), $event)"
          @dragend="handleDragEnd"
          @dragover.prevent="handleStaffDragOver"
          @drop="handleAnswerDrop(getOptionIndex('left', index), $event)"
          @touchstart="handleAnswerTouchStart(getOptionIndex('left', index), $event)"
          @touchmove.prevent="handleTouchMove"
          @touchend="handleAnswerDropTouchEnd(getOptionIndex('left', index), $event)"
          @click="handleClickOption(getOptionIndex('left', index))"
        >
          {{ option.displayName }}
        </div>
      </div>

      <!-- Center staff -->
      <div 
        class="staff-container"
        :class="{ 'drag-over': staffDragOver }"
        @dragover.prevent="handleStaffDragOver"
        @dragleave="handleStaffDragLeave"
        @drop="handleStaffDropFromAnswer"
      >
        <div 
          ref="staffContainer" 
          class="staff-vexflow"
          draggable="true"
          @dragstart="handleStaffNoteDragStart"
          @dragend="handleDragEnd"
          @touchstart="handleStaffNoteTouchStart"
          @touchend="handleStaffNoteTouchEnd"
        ></div>
      </div>

      <!-- Right side answers (2 options) -->
      <div class="answers-right">
        <div
          v-for="(option, index) in rightOptions"
          :key="'right-' + index"
          class="response-option"
          :class="{
            'drag-over': dragOverIndex === getOptionIndex('right', index),
            'correct': option.correct && (showFeedback || showCorrectAnswer),
            'incorrect': option.incorrect && showFeedback
          }"
          draggable="true"
          @dragstart="handleAnswerDragStart(getOptionIndex('right', index), $event)"
          @dragend="handleDragEnd"
          @dragover.prevent="handleStaffDragOver"
          @drop="handleAnswerDrop(getOptionIndex('right', index), $event)"
          @touchstart="handleAnswerTouchStart(getOptionIndex('right', index), $event)"
          @touchmove.prevent="handleTouchMove"
          @touchend="handleAnswerDropTouchEnd(getOptionIndex('right', index), $event)"
          @click="handleClickOption(getOptionIndex('right', index))"
        >
          {{ option.displayName }}
        </div>
      </div>
    </div>

    <div class="feedback" :class="{ 'feedback-visible': showFeedback }">
      <p :class="feedbackClass">{{ feedbackMessage }}</p>
    </div>

    <div v-if="responseOptions.length === 0" class="loading-message">
      {{ language === 'en' ? 'Preparing questions...' : 'Подготовка вопросов...' }}
    </div>
  </div>
</template>

<script>
import { t } from '../i18n.js'
import { generateNotes, getOctaveNameKey } from '../utils/notes.js'
import { renderStaffWithNote } from '../utils/vexflowHelper.js'

export default {
  name: 'Screen2',
  props: {
    language: {
      type: String,
      default: 'en'
    },
    selectedOctaves: {
      type: Array,
      required: true
    },
    selectedClefs: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      studyDictionary: [],
      currentNote: null,
      responseOptions: [],
      isDragging: false,
      dragOverIndex: null,
      staffDragOver: false,
      showFeedback: false,
      showCorrectAnswer: false,
      mistakes: {},
      wrongCount: 0,
      touchStartX: null,
      touchStartY: null,
      isTouching: false,
      draggedAnswerIndex: null
    }
  },
  computed: {
    remainingNotes() {
      // Count should always reflect the actual number of notes remaining in the dictionary
      // When a note is answered incorrectly, it stays in the dictionary, so count stays the same
      // When a note is answered correctly, it's removed, so count decreases
      return this.studyDictionary.length
    },
    currentClef() {
      return this.currentNote?.clef || 'treble'
    },
    leftOptions() {
      return this.responseOptions.slice(0, 2)
    },
    rightOptions() {
      return this.responseOptions.slice(2, 4)
    },
    feedbackClass() {
      return this.showFeedback && this.responseOptions.some(o => o.correct) 
        ? 'correct-feedback' 
        : 'incorrect-feedback'
    },
    feedbackMessage() {
      if (!this.showFeedback) return ''
      if (this.responseOptions.some(o => o.correct)) {
        return t('correct', this.language)
      }
      return t('incorrect', this.language)
    }
  },
    mounted() {
      this.initializeGame()
      // Render staff after component is mounted
      this.$nextTick(() => {
        if (this.currentNote) {
          this.renderStaff()
        }
      })
    },
  watch: {
    selectedOctaves: {
      handler() {
        if (this.selectedOctaves.length > 0 && this.selectedClefs.length > 0) {
          this.initializeGame()
        }
      },
      immediate: false
    },
    selectedClefs: {
      handler() {
        if (this.selectedOctaves.length > 0 && this.selectedClefs.length > 0) {
          this.initializeGame()
        }
      },
      immediate: false
    },
    currentNote: {
      handler(newNote) {
        if (newNote && this.$refs.staffContainer) {
          this.$nextTick(() => {
            this.renderStaff()
          })
        }
      },
      immediate: false
    }
  },
  methods: {
    t(key) {
      return t(key, this.language)
    },
    initializeGame() {
      try {
        const allNotes = generateNotes(this.selectedOctaves, this.selectedClefs)
        if (allNotes.length === 0) {
          console.error('No notes generated. Check octave and clef selection.')
          return
        }
        this.studyDictionary = [...allNotes]
        this.mistakes = {}
        this.wrongCount = 0
        this.nextNote()
      } catch (error) {
        console.error('Error initializing game:', error)
      }
    },
    nextNote() {
      if (this.studyDictionary.length === 0) {
        this.$emit('game-finished', this.mistakes)
        return
      }

      // Select random note from dictionary
      const randomIndex = Math.floor(Math.random() * this.studyDictionary.length)
      this.currentNote = this.studyDictionary[randomIndex]

      // Generate 4 response options (1 correct + 3 random)
      this.generateResponseOptions()
      this.showFeedback = false
      this.showCorrectAnswer = false
      
      // Render staff with new note
      this.$nextTick(() => {
        this.renderStaff()
      })
    },
    renderStaff() {
      if (!this.currentNote || !this.$refs.staffContainer) return
      
      try {
        renderStaffWithNote(
          this.$refs.staffContainer,
          this.currentNote,
          this.currentNote.clef
        )
      } catch (error) {
        console.error('Error rendering staff:', error)
      }
    },
    generateResponseOptions() {
      const currentNoteName = this.currentNote.note
      const usedNoteNames = new Set([currentNoteName])
      const options = [this.currentNote]
      
      // Generate 3 random wrong options with unique note names
      const allNotes = generateNotes(this.selectedOctaves, this.selectedClefs)
      const wrongOptions = allNotes.filter(note => 
        note.id !== this.currentNote.id &&
        !usedNoteNames.has(note.note) // Filter out duplicate note names
      )
      
      // Shuffle and take 3 random wrong options with unique names
      const shuffled = wrongOptions.sort(() => Math.random() - 0.5)
      for (const note of shuffled) {
        if (!usedNoteNames.has(note.note)) {
          options.push(note)
          usedNoteNames.add(note.note)
          if (options.length >= 4) break // We need 4 total options
        }
      }
      
      // Shuffle all options
      this.responseOptions = options
        .map(opt => ({
          ...opt,
          displayName: opt.displayName[this.language], // Just note name, no octave
          correct: false,
          incorrect: false
        }))
        .sort(() => Math.random() - 0.5)
    },
    getOptionIndex(side, index) {
      return side === 'left' ? index : index + 2
    },
    handleAnswerDragStart(index, e) {
      this.isDragging = true
      this.draggedAnswerIndex = index
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', index.toString())
    },
    handleStaffNoteDragStart(e) {
      this.isDragging = true
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', 'staff-note')
    },
    handleDragEnd() {
      this.isDragging = false
      this.dragOverIndex = null
      this.staffDragOver = false
      this.draggedAnswerIndex = null
    },
    handleStaffDragOver(e) {
      e.preventDefault()
      this.staffDragOver = true
    },
    handleStaffDragLeave() {
      this.staffDragOver = false
    },
    handleStaffDropFromAnswer(e) {
      e.preventDefault()
      this.staffDragOver = false
      if (this.draggedAnswerIndex !== null) {
        this.checkAnswer(this.draggedAnswerIndex)
      }
    },
    handleAnswerDrop(index, e) {
      e.preventDefault()
      this.dragOverIndex = null
      const data = e.dataTransfer.getData('text/plain')
      if (data === 'staff-note') {
        // Staff note dropped on answer
        this.checkAnswer(index)
      }
    },
    handleAnswerDropTouchEnd(index, e) {
      if (this.isTouching) {
        const touch = e.changedTouches[0]
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        if (element && element.classList.contains('response-option')) {
          this.checkAnswer(index)
        }
        this.handleTouchEnd()
      }
    },
    handleAnswerTouchStart(index, e) {
      this.isTouching = true
      this.draggedAnswerIndex = index
      const touch = e.touches[0]
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
    },
    handleStaffNoteTouchStart(e) {
      this.isTouching = true
      const touch = e.touches[0]
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
    },
    handleStaffTouchEnd(e) {
      if (this.isTouching && this.draggedAnswerIndex !== null) {
        const touch = e.changedTouches[0]
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        if (element && (element.classList.contains('staff-container') || element.closest('.staff-container'))) {
          this.checkAnswer(this.draggedAnswerIndex)
        }
        this.handleTouchEnd()
      }
    },
    handleStaffNoteTouchEnd(e) {
      if (this.isTouching) {
        const touch = e.changedTouches[0]
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        if (element && element.classList.contains('response-option')) {
          const parent = element.closest('.answers-left, .answers-right')
          if (parent) {
            const side = parent.classList.contains('answers-left') ? 'left' : 'right'
            const index = Array.from(parent.children).indexOf(element)
            if (index !== -1) {
              // Staff note dragged to answer - check if that answer is correct
              this.checkAnswer(this.getOptionIndex(side, index))
            }
          }
        }
        this.handleTouchEnd()
      }
    },
    handleTouchStart(e) {
      this.isTouching = true
      const touch = e.touches[0]
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
    },
    handleTouchMove(e) {
      if (!this.isTouching) return
      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      if (element && element.classList.contains('staff-container')) {
        this.staffDragOver = true
      } else if (element && element.classList.contains('response-option')) {
        const parent = element.closest('.answers-left, .answers-right')
        if (parent) {
          const side = parent.classList.contains('answers-left') ? 'left' : 'right'
          const index = Array.from(parent.children).indexOf(element)
          if (index !== -1) {
            this.dragOverIndex = this.getOptionIndex(side, index)
          }
        }
      } else {
        this.dragOverIndex = null
        this.staffDragOver = false
      }
    },
    handleTouchEnd() {
      this.isTouching = false
      this.touchStartX = null
      this.touchStartY = null
      this.draggedAnswerIndex = null
    },
    handleClickOption(index) {
      // Allow click/tap as alternative to drag and drop
      // Prevent interaction when showing feedback or correct answer
      if (!this.showFeedback && !this.showCorrectAnswer) {
        this.checkAnswer(index)
      }
    },
    checkAnswer(index) {
      // Prevent checking answers when showing feedback or correct answer
      if (this.showFeedback || this.showCorrectAnswer) {
        return
      }
      
      this.dragOverIndex = null
      const selectedOption = this.responseOptions[index]
      
      // Check if correct - match by ID to ensure we're comparing the exact same note
      // (since multiple notes can have the same note name in different octaves)
      if (selectedOption.id === this.currentNote.id) {
        // Correct answer - remove from dictionary
        // Create a new array to ensure Vue reactivity detects the change
        const noteIndex = this.studyDictionary.findIndex(n => n.id === this.currentNote.id)
        if (noteIndex > -1) {
          // Use filter to create a new array reference for better Vue reactivity
          this.studyDictionary = this.studyDictionary.filter(n => n.id !== this.currentNote.id)
        }
        selectedOption.correct = true
        this.showFeedback = true
        
        // Check if game is finished (dictionary is empty)
        if (this.studyDictionary.length === 0) {
          // Game finished - clear current note and move to statistics screen after delay
          setTimeout(() => {
            this.currentNote = null
            this.responseOptions = []
            this.$emit('game-finished', this.mistakes)
          }, 1000)
        } else {
          // Move to next note after delay
          setTimeout(() => {
            this.nextNote()
          }, 1000)
        }
      } else {
        // Wrong answer - count mistake and keep in dictionary
        selectedOption.incorrect = true
        this.showFeedback = true
        this.showCorrectAnswer = false
        this.wrongCount++
        
        // Track mistake with note name and octave name (not number)
        // Use the octaveNameKey directly from the note object
        const octaveNameKey = this.currentNote.octaveNameKey || getOctaveNameKey(this.currentNote.octave)
        const noteKey = `${this.currentNote.note}-${octaveNameKey}`
        if (!this.mistakes[noteKey]) {
          this.mistakes[noteKey] = {
            note: this.currentNote.note,
            octave: this.currentNote.octave,
            octaveNameKey: octaveNameKey,
            count: 0
          }
        }
        this.mistakes[noteKey].count++
        
        // After showing error message, show the correct answer
        setTimeout(() => {
          // Find and highlight the correct answer
          const correctOptionIndex = this.responseOptions.findIndex(opt => opt.id === this.currentNote.id)
          if (correctOptionIndex !== -1) {
            this.responseOptions[correctOptionIndex].correct = true
            this.showCorrectAnswer = true
          }
          
          // Move to next note after showing correct answer
          setTimeout(() => {
            this.nextNote()
          }, 1500)
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>
.feedback {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s;
}

.feedback.feedback-visible {
  visibility: visible;
  opacity: 1;
}

.correct-feedback {
  color: #28a745;
}

.incorrect-feedback {
  color: #dc3545;
}

.loading-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
}
</style>

