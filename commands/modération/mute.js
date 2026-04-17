import { PermissionsBitField } from 'discord.js';

export default {
  name: 'mute',
  permissions: ['ModerateMembers'],

  async execute(message) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Mentionne un membre.');

    await member.timeout(10 * 60 * 1000); // 10 minutes
    message.channel.send(`🔇 ${member.user.tag} est mute.`);
  }
};
