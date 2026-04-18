// Remplace par ton ID de rôle et ID de channel où envoyer le message
const PARTICIPANT_ROLE_ID = '1409519892893274132';
const EVENT_CHANNEL_ID = '1409520067057684573';

// Date/heure de début de ton event aujourd'hui à 23h39
const now = new Date();
const eventStart = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  23,
  39,
  0
);

const diffMs = eventStart - now;
const tenMinutes = 10 * 60 * 1000;

if (diffMs > tenMinutes) {
  setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(EVENT_CHANNEL_ID);
      channel.send(`<@&${PARTICIPANT_ROLE_ID}> Le rappel de l'event dans 10 minutes ! Préparez-vous !`);
    } catch (error) {
      console.error('Erreur lors de l’envoi du rappel event :', error);
    }
  }, diffMs - tenMinutes);
} else {
  console.log('L’event est déjà dans moins de 10 minutes ou passé, pas de rappel programmé.');
}
