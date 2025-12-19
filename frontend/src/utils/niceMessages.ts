/**
 * FRONTEND - Mensajes lindos para Wely (abuelita Hury)
 * 
 * Mensajes cariñosos personalizados que aparecen en diferentes momentos del juego.
 */

export type MessageType = 'start' | 'win' | 'lose' | 'morning' | 'afternoon' | 'evening' | 'night' | 'combo' | 'foundation' | 'patience';

interface NiceMessages {
  start: string[];
  win: string[];
  lose: string[];
  morning: string[];
  afternoon: string[];
  evening: string[];
  night: string[];
  combo: string[];
  foundation: string[];
  patience: string[];
}

const messages: NiceMessages = {
  start: [
    '¡Hola, Wely! 💝 Disfruta tu partida con calma',
    'Hoy es un día perfecto para jugar tranquila, abuelita Hury 😌',
    '¡Que tengas un lindo momento, Wely! 🌸',
    'Tómate tu tiempo, Hury, no hay prisa 🌷',
    'Preparé este juego especialmente para ti, Wely ❤️',
    'Disfruta cada carta, abuelita Hury querida 🃏',
    'Un juego relajante para ti, Wely, con todo mi cariño 💖',
    '¡A jugar, Wely! Las cartas están listas para ti 🎴'
  ],
  
  win: [
    '¡Lo lograste, Wely! Eres una maestra 🏆',
    '¡Ganaste, abuelita Hury! Sabía que podías hacerlo 💖',
    '¡Increíble, Wely! Eres la mejor 🌟',
    '¡Victoria perfecta, Hury! Me siento orgulloso de ti 💝',
    '¡Qué bien jugaste, Wely! Eres una campeona 🎉',
    'Ganaste con gracia y paciencia, como siempre, abuelita Hury 🌹',
    '¡Felicidades, Wely! Tu estrategia fue perfecta ✨',
    'Sabía que ganarías, Hury. Eres excepcional 💕'
  ],
  
  lose: [
    'No te preocupes, Wely, lo importante es disfrutar 🌷',
    'Perder también es parte del juego, abuelita Hury, y tú sigues siendo la mejor 💫',
    'Inténtalo de nuevo cuando quieras, Wely, no hay prisa 🌸',
    'Cada partida es una oportunidad para relajarse, Hury 😌',
    'El solitario es así, Wely, a veces sale y a veces no 🍃',
    'Tu compañía es lo que más importa, abuelita Hury, no el resultado 💝',
    'Gracias por jugar, Wely. Eres una campeona siempre ❤️'
  ],
  
  morning: [
    '¡Buenos días, Wely! ☀️ Un nuevo día para jugar',
    'Hury, el café y las cartas te esperan ☕🃏',
    '¡Arriba, abuelita! Las cartas tienen ganas de bailar 💃',
    'Buen día, Wely. Que disfrutes esta mañana 🌅',
    '¡Hola, Hury! Empecemos el día con una partida 🌄',
    'Buenos días, Wely. Juguemos tranquilas esta mañana ☀️'
  ],
  
  afternoon: [
    'Buenas tardes, Wely! Hora perfecta para jugar 🌤️',
    '¡Hola, Hury! Una partidita para la tarde 🎴',
    'Wely, disfruta esta tarde con tus cartas favoritas 🌺',
    'Tarde tranquila para ti, abuelita Hury 😊',
    '¡Qué linda tarde para jugar, Wely! 🌸'
  ],
  
  evening: [
    'Buenas noches, Wely! 🌙 Hora de relajarse',
    'Wely, las noches son perfectas para el solitario 🌟',
    '¡Hola, Hury! Una partidita antes de descansar 🌛',
    'Noche tranquila para ti, Wely querida 💫',
    '¡Buenas noches, abuelita Hury! Juguemos un ratito 🌜'
  ],
  
  night: [
    'Wely, ¿no duermes? Juguemos despacito 🌙',
    'Hury, una partidita nocturna para relajar 🌃',
    'Wely, las cartas te acompañan en la noche 💫',
    '¡Hola, Hury! Noche de solitario contigo ⭐'
  ],
  
  combo: [
    '¡Uy, Wely está que vuela! 🚀',
    '¡Qué habilidosa, Hury! 👏',
    '¡Mira nomás, experta en solitario! 🌟',
    '¡Así se hace, Wely! Imparable 💪',
    '¡Qué racha, abuelita Hury! 🔥',
    '¡Wely en modo campeona! 🏆',
    '¡Impresionante, Hury! Una tras otra 🎯'
  ],
  
  foundation: [
    '¡Al arca, Hury! 🎯',
    '¡Bien hecho, Wely! Otra carta a casa 🏠',
    '¡Esa mano, abuelita! 👌',
    '¡Perfecto, Wely! Una más arriba ⬆️',
    '¡Excelente, Hury! Vas muy bien 💚',
    '¡Así se juega, Wely! 🎴'
  ],
  
  patience: [
    'Tranquila, Wely. Con calma se gana 🧘‍♀️',
    'No hay apuro, Hury. Las cartas te esperan ⏰',
    'Respira hondo, abuelita. Tú puedes 💪',
    'Tómate tu tiempo, Wely. Sin presión 🌸',
    'Paciencia, Hury. La jugada vendrá 🍃',
    'Wely, a veces hay que pensar un poquito 🤔',
    'Tranquila, abuelita. El juego no se va 💝'
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
