import { PermissionFlagsBits } from 'discord.js';

export default {
  name: 'unmute',
  description: 'Retire le mute (timeout) d’un membre',
  usage: '+unmute @membre',
  permissions: [PermissionFlagsBits.ModerateMembers],

  /**
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   * @param {import('discord.js').Client} client
   */
  async execute(message, args, client) {
    // Vérification permission Discord
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('❌ Tu n’as pas la permission de unmute.');
    }

    // Vérification mention
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Mentionne un membre à unmute.');
    }

    // Vérification état mute
    if (!member.isCommunicationDisabled()) {
      return message.reply('⚠️ Ce membre n’est pas mute.');
    }

    try {
      await member.timeout(null);

      return message.channel.send(
        `🔊 **${member.user.tag}** a été unmute par **${message.author.tag}**.`
      );
    } catch (error) {
      console.error(error);
      return message.reply('❌ Impossible de retirer le mute.');
    }
  },
};
