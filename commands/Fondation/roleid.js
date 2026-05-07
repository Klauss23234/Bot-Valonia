import { PermissionsBitField, EmbedBuilder } from 'discord.js';

export default {
  name: 'roleid',
  description: 'Affiche tous les rôles du serveur avec leurs IDs',
  usage: '+roleid',
  category: 'Staff',
  permissions: ['ManageGuild'],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription('❌ Tu n\'as pas la permission **ManageGuild**.')
        ]
      });
    }

    const guild = message.guild;
    await guild.roles.fetch(); // S'assure que le cache est à jour

    const roles = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .filter(role => role.name !== '@everyone');

    if (roles.size === 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription('❌ Aucun rôle trouvé sur ce serveur.')
        ]
      });
    }

    // Découper en pages de 20 rôles max pour rester propre
    const roleArray = [...roles.values()];
    const chunkSize = 20;
    const pages = [];

    for (let i = 0; i < roleArray.length; i += chunkSize) {
      const chunk = roleArray.slice(i, i + chunkSize);
      const description = chunk
        .map(role => `${role} \`${role.id}\``)
        .join('\n');
      pages.push(description);
    }

    for (let i = 0; i < pages.length; i++) {
      const embed = new EmbedBuilder()
        .setTitle(`🏷️ Rôles du serveur${pages.length > 1 ? ` — Page ${i + 1}/${pages.length}` : ''}`)
        .setDescription(pages[i])
        .setColor('#5865F2')
        .setFooter({
          text: `${roles.size} rôle${roles.size > 1 ? 's' : ''} au total • ${guild.name}`,
          iconURL: guild.iconURL({ dynamic: true }) ?? undefined
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    }
  }
};