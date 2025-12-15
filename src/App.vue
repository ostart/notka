<template>
  <div class="screen-container">
    <div class="language-selector">
      <button 
        class="lang-button" 
        :class="{ active: language === 'en' }"
        @click="language = 'en'"
      >
        EN
      </button>
      <button 
        class="lang-button" 
        :class="{ active: language === 'ru' }"
        @click="language = 'ru'"
      >
        RU
      </button>
    </div>

    <Screen1 
      v-if="currentScreen === 1"
      :language="language"
      @start-game="handleStartGame"
    />
    <Screen2 
      v-if="currentScreen === 2"
      :language="language"
      :selected-octaves="selectedOctaves"
      :selected-clefs="selectedClefs"
      @game-finished="handleGameFinished"
      @back-to-selection="currentScreen = 1"
    />
    <Screen3 
      v-if="currentScreen === 3"
      :language="language"
      :mistakes="mistakes"
      @replay="handleReplay"
    />
  </div>
</template>

<script>
import Screen1 from './components/Screen1.vue'
import Screen2 from './components/Screen2.vue'
import Screen3 from './components/Screen3.vue'

export default {
  name: 'App',
  components: {
    Screen1,
    Screen2,
    Screen3
  },
  data() {
    return {
      currentScreen: 1,
      language: 'en',
      selectedOctaves: [],
      selectedClefs: [],
      mistakes: {}
    }
  },
  methods: {
    handleStartGame(octaves, clefs) {
      this.selectedOctaves = octaves
      this.selectedClefs = clefs
      this.currentScreen = 2
      this.mistakes = {}
    },
    handleGameFinished(mistakesData) {
      this.mistakes = mistakesData
      this.currentScreen = 3
    },
    handleReplay() {
      this.currentScreen = 1
      this.mistakes = {}
    }
  }
}
</script>

