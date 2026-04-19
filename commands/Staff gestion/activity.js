import { EmbedBuilder } from 'discord.js';

export default {
  name: 'activity',
  description: 'Affiche une activité',
  usage: '',
  execute(message, args, client) {
    const { config } = client;
    const prefix = config.prefix;

    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('🏓 Activité')
      .setDescription(`Commande exécutée : \`${prefix}activity\``)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
