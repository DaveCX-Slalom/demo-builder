import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Tokens from BRIEF §11 (Lightning-inspired palette). Brand colors from Studio override primary/secondary at runtime.
export default createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } }, // SVG paths from @mdi/js: no font download
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#0B5CAB', // SLDS "brand accessible": 6:1 on the grey page, so it is safe for link text
          secondary: '#0176D3', // SLDS brand blue: 4.6:1 on white. Fills, focus ring, current stage
          background: '#F3F3F3',
          surface: '#FFFFFF',
          error: '#BA0517',
          warning: '#955700', // BRIEF amber #B26A00 is 4.2:1 on white; darkened to pass 4.5:1 as text
          'on-surface': '#181818',
          'on-background': '#181818',
          success: '#2E844A',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#78B0FD',
          secondary: '#1B96FF',
          background: '#0F1722',
          surface: '#18222F',
          error: '#EF7B7B',
          warning: '#E0A24A',
          success: '#6CC070',
        },
      },
    },
  },
  defaults: { VCard: { rounded: true } }, // 4px radius, as in Lightning (buttons keep Vuetify's 4px default)
})
