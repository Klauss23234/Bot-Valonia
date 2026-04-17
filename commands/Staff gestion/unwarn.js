import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const warnings = new Map();

function getWarnings(guildId, userId) {
  const key = `${guildId}-${userId}`;
  if (!warnings.has(key)) {
    warnings.set(key, []);
  }
  return warnings.get(key);
}

function removeWarning(guildId, userId, warnId) {
  const key = `${guildId}-${userId}`;
  const userWarns = getWarnings(guildId, userId);
  const filtered = userWarns.filter(w => w.id !== warnId);
  warnings.set(key, filtered);
  return userWarns.length !== filtered.length;
}

export default {
  name: 'unwarn',
  description: 'Retire un avertissement d\'un membre',
  aliases: ['removewarn', 'deletewarn'],
  usage: '@membre <ID du warn>',
  args: true,
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first();
    
    if (!member) {
      return message.reply('❌ Mentionne un membre !');
    }
    
    const warnId = parseInt(args[1]);
    
    if (isNaN(warnId)) {
      return message.reply('❌ Indique l\'ID du warn à retirer !\nUtilise `+warnings @membre` pour voir les IDs.');
    }
    
    const removed = removeWarning(message.guild.id, member.id, warnId);
    
    if (!removed) {
      return message.reply('❌ Warn introuvable pour ce membre.');
    }
    
    const userWarns = getWarnings(message.guild.id, member.id);
    
    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Avertissement retiré')
      .addFields(
        { name: '👤 Membre', value: `${member.user.tag}`, inline: true },
        { name: '👮 Par', value: `${message.author.tag}`, inline: true },
        { name: '⚠️ Warns restants', value: `${userWarns.length}`, inline: true }
      )
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
    
    // Log
    const setlogsCmd = client.commands.get('setlogs');
    if (setlogsCmd) {
      const logChannelId = setlogsCmd.getLogChannel(message.guild.id);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Avertissement retiré')
            .addFields(
              { name: '👤 Membre', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: '👮 Par', value: `${message.author.tag}`, inline: true },
              { name: '🆔 Warn ID', value: `${warnId}`, inline: true }
            )
            .setTimestamp();
          
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    }
  }
};