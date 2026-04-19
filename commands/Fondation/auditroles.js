import { PermissionsBitField, EmbedBuilder } from 'discord.js';

export default {
  name: 'auditroles',
  description: 'Vérifie les rôles dangereux ou inutilisés.',
  usage: '',
  category: 'Staff',

  execute(message, args, client) {
    try {
      const roles = message.guild.roles.cache.filter(r => r.name !== '@everyone');

      // Rôles sans membres
      const unused = roles.filter(r => r.members.size === 0).map(r => r.name);

      // Rôles avec permission Admin
      const dangerous = roles.filter(r => r.permissions.has(PermissionsBitField.Flags.Administrator)).map(r => r.name);

      const embed = new EmbedBuilder()
        .setTitle('📊 Audit des rôles')
        .setColor('ORANGE')
        .addFields(
          { name: 'Rôles inutilisés', value: unused.length ? unused.join(', ') : 'Aucun', inline: false },
          { name: 'Rôles dangereux (Admin)', value: dangerous.length ? dangerous.join(', ') : 'Aucun', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur auditroles :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};
