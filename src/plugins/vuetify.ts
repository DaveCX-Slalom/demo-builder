import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Tokens from BRIEF §11. Brand colors from Studio override primary/secondary at runtime.
export default createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } }, // SVG paths from @mdi/js: no font download
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#0B3D6B',
          secondary: '#12A59A',
          background: '#F4F6F9',
          surface: '#FFFFFF',
          error: '#C62828',
          warning: '#955700', // BRIEF amber #B26A00 is 4.2:1 on white; darkened to pass 4.5:1 as text
          'on-surface': '#14202E',
          'on-background': '#14202E',
          success: '#2E7D32',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#6FA8DC',
          secondary: '#3CC9BD',
          background: '#0F1722',
          surface: '#18222F',
          error: '#EF7B7B',
          warning: '#E0A24A',
          success: '#6CC070',
        },
      },
    },
  },
  defaults: { VBtn: { rounded: 'lg' }, VCard: { rounded: 'lg' } },
})
