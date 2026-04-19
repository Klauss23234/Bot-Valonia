import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

// Stockage des warns en mémoire
const warnings = new Map();

function getWarnings(guildId, userId) {
  const key = `${guildId}-${userId}`;
  if (!warnings.has(key)) {
    warnings.set(key, []);
  }
  return warnings.get(key);
}

function addWarning(guildId, userId, data) {
  const key = `${guildId}-${userId}`;
  const userWarns = getWarnings(guildId, userId);
  userWarns.push(data);
  warnings.set(key, userWarns);
}

export default {
  name: 'warn',
  description: 'Avertit un membre',
  aliases: ['avertir', 'warning'],
  usage: '@membre <raison>',
  args: true,
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first();
    
    if (!member) {
      return message.reply('❌ Mentionne un membre à avertir !');
    }
    
    if (member.id === message.author.id) {
      return message.reply('❌ Tu ne peux pas t\'avertir toi-même !');
    }
    
    if (member.id === message.guild.ownerId) {
      return message.reply('❌ Tu ne peux pas avertir le propriétaire du serveur !');
    }
    
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply('❌ Tu ne peux pas avertir ce membre (rôle égal ou supérieur).');
    }
    
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    
    const warnData = {
      id: Date.now(),
      reason: reason,
      moderator: message.author.id,
      date: Date.now()
    };
    
    addWarning(message.guild.id, member.id, warnData);
    const userWarns = getWarnings(message.guild.id, member.id);
    
    // MP au membre
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle('⚠️ Tu as reçu un avertissement')
        .setDescription(`Tu as été averti sur **${message.guild.name}**`)
        .addFields(
          { name: '📝 Raison', value: reason, inline: false },
          { name: '👮 Par', value: message.author.tag, inline: true },
          { name: '⚠️ Total d\'avertissements', value: `${userWarns.length}`, inline: true }
        )
        .setFooter({ text: 'Fais attention à ton comportement !' })
        .setTimestamp();
      
      await member.send({ embeds: [dmEmbed] });
    } catch (error) {
      // MP fermés
    }
    
    // Confirmation
    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('⚠️ Membre averti')
      .addFields(
        { name: '👤 Membre', value: `${member.user.tag}`, inline: true },
        { name: '👮 Par', value: `${message.author.tag}`, inline: true },
        { name: '📝 Raison', value: reason, inline: false },
        { name: '⚠️ Total d\'avertissements', value: `${userWarns.length}`, inline: true }
      )
      .setTimestamp();
    
    // Avertissement si beaucoup de warns
    if (userWarns.length >= 3) {
      embed.addFields({
        name: '🚨 Attention !',
        value: `Ce membre a maintenant **${userWarns.length}** avertissement(s). Considérez une sanction plus sévère.`,
        inline: false
      });
      embed.setColor('#ED4245');
    }
    
    message.reply({ embeds: [embed] });
    
    // Log
    const setlogsCmd = client.commands.get('setlogs');
    if (setlogsCmd) {
      const logChannelId = setlogsCmd.getLogChannel(message.guild.id);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('⚠️ Avertissement')
            .addFields(
              { name: '👤 Membre', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: '👮 Modérateur', value: `${message.author.tag}`, inline: true },
              { name: '📝 Raison', value: reason, inline: false },
              { name: '⚠️ Total warns', value: `${userWarns.length}`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
          
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    }
  },
  
  // Fonctions exportées
  getWarnings,
  addWarning
};