/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#FFFFFF',
    tint: '#FFD700',

    background: '#0A192F',
    foreground: '#FFFFFF',

    card: '#10243D',
    cardForeground: '#FFFFFF',

    primary: '#FFD700',
    primaryForeground: '#0A192F',

    secondary: '#17304D',
    secondaryForeground: '#FFFFFF',

    muted: '#122943',
    mutedForeground: '#A5B5C8',

    accent: '#FFD700',
    accentForeground: '#0A192F',

    destructive: '#FF5E68',
    destructiveForeground: '#FFFFFF',

    border: '#29415D',
    input: '#29415D',
  },

  radius: 18,
};

export default colors;
