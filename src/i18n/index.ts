import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import cs from './cs'
import uk from './uk'

const savedLang = localStorage.getItem('i18n-lang') ?? 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      cs: { translation: cs },
      uk: { translation: uk },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

i18n.on('languageChanged', (lang) => {
  localStorage.setItem('i18n-lang', lang)
})

export default i18n
