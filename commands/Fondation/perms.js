import { PermissionsBitField, EmbedBuilder } from 'discord.js';

export default {
  name: 'perms',
  description: 'Vérifie les permissions du bot sur le serveur',

  async execute(message) {
    const botMember = message.guild.members.me;

    const permissionsToCheck = [
      { name: 'ADMINISTRATOR', flag: PermissionsBitField.Flags.Administrator },
      { name: 'MANAGE_CHANNELS', flag: PermissionsBitField.Flags.ManageChannels },
      { name: 'MANAGE_ROLES', flag: PermissionsBitField.Flags.ManageRoles },
      { name: 'SEND_MESSAGES', flag: PermissionsBitField.Flags.SendMessages },
      { name: 'MENTION_EVERYONE', flag: PermissionsBitField.Flags.MentionEveryone },
      { name: 'KICK_MEMBERS', flag: PermissionsBitField.Flags.KickMembers },
      { name: 'BAN_MEMBERS', flag: PermissionsBitField.Flags.BanMembers }
    ];

    const results = permissionsToCheck.map(p => {
      const hasPerm = botMember.permissions.has(p.flag);
      return `${hasPerm ? '✅' : '❌'} ${p.name}`;
    });

    const embed = new EmbedBuilder()
      .setColor('#2f3136')
      .setTitle('🛡️ Permissions du bot')
      .setDescription(results.join('\n'))
      .setFooter({ text: message.guild.name })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
