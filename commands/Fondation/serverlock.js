import { PermissionsBitField, ChannelType } from 'discord.js';

export default {
  name: 'serverlock',
  description: 'Verrouille ou déverrouille tous les salons',
  category: 'Staff',

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ Permission requise : ManageChannels');
    }

    const sub = args[0] || 'lock';
    const lock = sub !== 'unlock';

    let count = 0;

    for (const ch of message.guild.channels.cache.values()) {
      if (!ch.manageable) continue;
      if (![ChannelType.GuildText, ChannelType.GuildNews].includes(ch.type)) continue;

      await ch.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: !lock }
      ).catch(() => {});
      count++;
    }

    return message.reply(
      lock
        ? `🔒 **${count} salons verrouillés**`
        : `🔓 **${count} salons déverrouillés**`
    );
  }
};

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 COMMANDES SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- +serverlock           → Verrouille tous les salons
- +serverlock unlock    → Déverrouille tous les salons

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
