/**
 * FRONTEND - Mensajes lindos para la abuelita
 * 
 * Mensajes cariñosos que aparecen en diferentes momentos del juego.
 */

export type MessageType = 'start' | 'win' | 'lose';

interface NiceMessages {
  start: string[];
  win: string[];
  lose: string[];
}

const messages: NiceMessages = {
  start: [
    '¡Hola, abuelita! 💝 Disfruta tu partida con calma',
    'Hoy es un día perfecto para jugar tranquila 😌',
    '¡Que tengas un lindo momento, abuelita! 🌸',
    'Tómate tu tiempo, no hay prisa 🌷',
    'Preparé este juego especialmente para ti ❤️',
    'Disfruta cada carta, abuelita querida 🃏',
    'Un juego relajante para ti, con todo mi cariño 💖'
  ],
  
  win: [
    '¡Lo lograste, abuelita! Eres una maestra 🏆',
    '¡Ganaste! Sabía que podías hacerlo 💖',
    '¡Increíble, abuelita! Eres la mejor 🌟',
    '¡Victoria perfecta! Me siento orgulloso de ti 💝',
    '¡Qué bien jugaste! Eres una campeona 🎉',
    'Ganaste con gracia y paciencia, como siempre 🌹',
    '¡Felicidades! Tu estrategia fue perfecta ✨',
    'Sabía que ganarías, eres excepcional 💕'
  ],
  
  lose: [
    'No te preocupes, abuelita, lo importante es disfrutar 🌷',
    'Perder también es parte del juego, y tú sigues siendo la mejor 💫',
    'Inténtalo de nuevo cuando quieras, no hay prisa 🌸',
    'Cada partida es una oportunidad para relajarse 😌',
    'El solitario es así, a veces sale y a veces no 🍃',
    'Tu compañía es lo que más importa, no el resultado 💝',
    'Gracias por jugar, abuelita. Eres una campeona siempre ❤️'
  ]
};

/**
 * Obtiene un mensaje aleatorio según el tipo
 */
export function getRandomNiceMessage(type: MessageType): string {
  const messageList = messages[type];
  const randomIndex = Math.floor(Math.random() * messageList.length);
  return messageList[randomIndex];
}

/**
 * Obtiene todos los mensajes de un tipo (útil para testing)
 */
export function getAllMessages(type: MessageType): string[] {
  return [...messages[type]];
}
