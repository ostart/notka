export const translations = {
  en: {
    title: 'Learn Musical Notes',
    selectOctaves: 'Select Octaves',
    go: 'Go',
    contra: 'Contra',
    great: 'Great',
    small: 'Small',
    line1: '1 Line',
    line2: '2 Line',
    line3: '3 Line',
    quizTitle: 'Identify the Note',
    progress: 'Remaining: {count}',
    statistics: 'Game Statistics',
    topMistakes: 'Notes with Most Mistakes',
    replay: 'Play Again',
    correct: 'Correct!',
    incorrect: 'Incorrect!',
    noMistakes: 'Perfect! No mistakes!',
    mistake: 'mistake',
    mistakes: 'mistakes'
  },
  ru: {
    title: 'Изучите Ноты',
    selectOctaves: 'Выберите Октавы',
    go: 'Начать',
    contra: 'Контроктава',
    great: 'Большая',
    small: 'Малая',
    line1: 'Первая',
    line2: 'Вторая',
    line3: 'Третья',
    quizTitle: 'Определите Ноту',
    progress: 'Осталось: {count}',
    statistics: 'Статистика Игры',
    topMistakes: 'Ноты с Наибольшим Количеством Ошибок',
    replay: 'Начать снова',
    correct: 'Правильно!',
    incorrect: 'Неправильно!',
    noMistakes: 'Отлично! Без ошибок!',
    mistake: 'ошибка',
    mistakes: 'ошибок'
  }
}

export function t(key, lang = 'en') {
  return translations[lang]?.[key] || key
}

