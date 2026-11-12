export const COLOR_COMMANDS = [
  { label: 'Rojo', character: '1', color: '#F24F5E', ink: '#FFFFFF' },
  { label: 'Azul', character: '2', color: '#3478F6', ink: '#FFFFFF' },
  { label: 'Verde', character: '3', color: '#2FBF71', ink: '#071B2D' },
  { label: 'Amarillo', character: '4', color: '#FFD43B', ink: '#071B2D' },
  { label: 'Aqua', character: '5', color: '#31C7D4', ink: '#071B2D' },
  { label: 'Rosa', character: '6', color: '#E74BC4', ink: '#FFFFFF' },
] as const;

export type KairiCommand = (typeof COLOR_COMMANDS)[number]['character'] | '7';
