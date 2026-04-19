import { EmbedBuilder } from 'discord.js';

const afkUsers = new Map();

/**
 * Formate une durée en ms vers un texte lisible
 * ex: 732000 → "12min 12s"
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}min`;
  if (minutes > 0) return `${minutes}min ${seconds % 60}s`;
  return `${seconds}s`;
}

export default {
  name: 'afk',
  description: 'Se mettre en AFK',
  usage: '[raison]',

  // 🔒 Commande +afk
  execute(message, args) {
    const reason = args.join(' ') || 'AFK';

    afkUsers.set(message.author.id, {
      reason,
      since: Date.now(),
    });

    // Supprimer le message de commande
    message.delete().catch(() => {});

    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#57F287')
          .setDescription(
            `✅ **${message.author.username}** est maintenant AFK\n` +
            `📌 **${reason}**`
          ),
      ],
    });
  },

  // 🔔 Quand quelqu’un mentionne un utilisateur AFK
  checkAFK(message) {
    if (!message.mentions.users.size) return;

    for (const user of message.mentions.users.values()) {
      if (!afkUsers.has(user.id)) continue;

      const afkData = afkUsers.get(user.id);
      const duration = formatDuration(Date.now() - afkData.since);

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(
              `⏰ **${user.username} est AFK**\n` +
              `📌 Raison : **${afkData.reason}**\n` +
              `🕒 Depuis : **${duration}**`
            ),
        ],
      });
    }
  },

  // 🔓 Quand l’utilisateur AFK reparle
  removeAFK(message) {
    if (!afkUsers.has(message.author.id)) return;

    const afkData = afkUsers.get(message.author.id);
    const duration = formatDuration(Date.now() - afkData.since);

    afkUsers.delete(message.author.id);

    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#5865F2')
          .setDescription(
            `👋 **${message.author.username}** n’est plus AFK\n` +
            `⏱️ Durée : **${duration}**`
          ),
      ],
    });
  },
};
