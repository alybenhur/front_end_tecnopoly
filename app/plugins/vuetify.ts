import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { es } from 'vuetify/locale'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    locale: {
      locale: 'es',
      messages: { es },
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1565C0',
            secondary: '#42A5F5',
            accent: '#FF6F00',
            error: '#D32F2F',
            warning: '#F57C00',
            info: '#0288D1',
            success: '#388E3C',
          },
        },
      },
    },
  })
  app.vueApp.use(vuetify)
})
