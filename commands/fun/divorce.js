import { EmbedBuilder } from 'discord.js';

// Importe la Map partagée depuis marry.js
import marryCommand from './marry.js';

export default {
  name: 'divorce',
  description: 'Divorce de ton partenaire sur le serveur',
  usage: '',
  category: 'fun',

  async execute(message, args, client) {
    try {
      const marriages = marryCommand.marriages;
      const partnerId = marriages.get(message.author.id);

      if (!partnerId) return message.reply('💔 Tu n\'es pas marié(e) sur ce serveur !');

      const partner = await client.users.fetch(partnerId).catch(() => null);

      marriages.delete(partnerId);
      marriages.delete(message.author.id);

      const embed = new EmbedBuilder()
        .setColor('Grey')
        .setTitle('📜 Acte de divorce')
        .setDescription(`**${message.author.username}** a divorcé de **${partner?.username ?? 'son partenaire'}**.\n\nLes avocats sont en route... 💸`)
        .setFooter({ text: 'Les biens seront partagés équitablement... ou pas.', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur divorce :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};