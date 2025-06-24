import { alpha, createTheme, lighten, rgbToHex } from '@mui/material/styles';
import type { } from '@mui/x-data-grid/themeAugmentation';
//  // Import for MUI X Data Grid theme augmentation
const primaryBase = '#003566';
const secondaryBase = '#005eb8';

declare module '@mui/material/styles' {
  interface Theme {
    altColors: {
      primaryAlpha: string
      secondaryAlpha: string
      primaryLighter: string
      secondaryLighter: string
      greenSoft: string
      redSoft: string
      amberSoft: string
    }
  }
  interface ThemeOptions {
    altColors?: {
      primaryAlpha?: string
      secondaryAlpha?: string
      primaryLighter?: string
      secondaryLighter?: string
      greenSoft?: string
      redSoft?: string
      amberSoft?: string
    }
  }
}

const theme = createTheme({
  cssVariables: true,
  typography: {
    // fontFamily: 'var(--font-roboto)',
  },
  altColors: {
    primaryAlpha: alpha(primaryBase, 0.2),
    secondaryAlpha: alpha(secondaryBase, 0.2),
    primaryLighter: lighten(primaryBase, 0.9),
    secondaryLighter: lighten(secondaryBase, 0.9),
    greenSoft: rgbToHex('rgb(255, 250, 228)'),
    redSoft: rgbToHex('rgb(255, 224, 224)'),
    amberSoft: rgbToHex('rgb(255, 251, 227)'),
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: primaryBase,
        },

        secondary: {
          main: secondaryBase,
        },

        // Add required properties with default or placeholder values

      },
    },
  },
});

export default theme;
export type AppTheme = typeof theme;
