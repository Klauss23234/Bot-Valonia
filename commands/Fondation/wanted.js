import { EmbedBuilder } from 'discord.js';

const crimes = [
  'BEING TOO CRINGE', 'EXCESSIVE MEME USAGE', 'MAIN CHARACTER SYNDROME',
  'CHRONIC GHOSTING', 'FRIDGE CRIMES AT 2AM', 'TOO MUCH RIZZ',
  'REFUSING TO TOUCH GRASS', 'CHRONICALLY ONLINE',
];

export default {
  name: 'wanted',
  description: 'Génère une fausse affiche WANTED avec l\'avatar',
  usage: '@user',
  category: 'fun',

  execute(message, args, client) {
    try {
      const target = message.mentions.users.first() || message.author;
      const reward = (Math.floor(Math.random() * 950) + 50) * 1000;
      const crime = crimes[Math.floor(Math.random() * crimes.length)];

      const embed = new EmbedBuilder()
        .setColor('#8B4513')
        .setTitle('🤠 WANTED — DEAD OR ALIVE')
        .setDescription(
          `╔══════════════════════╗\n` +
          `║   **${target.username.toUpperCase()}**   \n` +
          `╚══════════════════════╝\n\n` +
          `💰 Récompense : **$${reward.toLocaleString()}**\n` +
          `🔫 Crime : \`${crime}\``
        )
        .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '⚠️ Dangerosité', value: '█'.repeat(Math.floor(Math.random() * 5) + 5) + '░'.repeat(3), inline: true },
          { name: '📍 Dernière localisation', value: 'Introuvable', inline: true },
        )
        .setFooter({ text: 'Signé : Le Shérif du Serveur', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur wanted :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};