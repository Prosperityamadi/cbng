/**
 * Core Typography Configurations
 * - Poppins: Used for headings, titles, buttons, badges, and brand display elements.
 * - Roboto: Used for body text, paragraphs, lists, descriptions, and smaller UI details.
 */

export const FONT_VARIABLES = {
  poppins: "'Poppins', sans-serif",
  roboto: "'Roboto', sans-serif",
} as const;

export const FONTS = {
  heading: 'font-poppins',
  body: 'font-roboto',
  title: 'font-poppins font-bold tracking-tight',
  button: 'font-poppins font-semibold text-sm',
  caption: 'font-roboto text-xs text-[#5C5652]',
} as const;
