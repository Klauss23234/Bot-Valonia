import { PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import crypto from 'crypto';

// ID DU SALON DE LOGS
const LOG_CHANNEL_ID = '1409639062750625883';

export default {
  name: 'ban',
  description: 'Bannit un membre avec dossier de modération complet',
  aliases: ['bannir'],
  usage: '<@membre> [raison]',
  args: true,
  permissions: [PermissionFlagsBits.BanMembers],

  async execute(message, args) {
    if (!message.guild) {
      return message.reply('❌ Cette commande ne peut être utilisée que sur un serveur.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Mentionne un membre à bannir.');
    }

    // Sécurité utilisateur
    if (member.id === message.author.id)
      return message.reply('❌ Tu ne peux pas te bannir toi-même.');

    if (member.id === message.guild.ownerId)
      return message.reply('❌ Tu ne peux pas bannir le propriétaire du serveur.');

    if (member.roles.highest.position >= message.member.roles.highest.position)
      return message.reply('❌ Rôle égal ou supérieur au tien.');

    // Sécurité BOT
    if (
      message.guild.members.me.roles.highest.position <=
      member.roles.highest.position
    ) {
      return message.reply('❌ Mon rôle est trop bas pour bannir ce membre.');
    }

    if (!member.bannable)
      return message.reply('❌ Permissions insuffisantes.');

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    const caseId = crypto.randomBytes(4).toString('hex').toUpperCase();

    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .map(r => r.toString())
      .join(', ') || 'Aucun';

    const createdAt = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;
    const joinedAt = member.joinedTimestamp
      ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
      : 'Inconnu';

    try {
      // MP utilisateur
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF3B3B')
            .setTitle('🔨 Bannissement définitif')
            .setDescription(`Tu as été banni de **${message.guild.name}**`)
            .addFields(
              { name: '🆔 Dossier', value: caseId },
              { name: '📝 Raison', value: reason },
              { name: '👮 Modérateur', value: message.author.tag }
            )
            .setTimestamp()
        ]
      }).catch(() => {});

      // BAN
      await member.ban({ reason, deleteMessageSeconds: 86400 });

      // Embed public
      const publicEmbed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('📁 Bannissement enregistré')
        .addFields(
          { name: '👤 Membre', value: member.user.tag, inline: true },
          { name: '👮 Modérateur', value: message.author.tag, inline: true },
          { name: '🆔 Dossier', value: caseId, inline: true },
          { name: '📝 Raison', value: reason }
        )
        .setTimestamp();

      await message.reply({ embeds: [publicEmbed] });

      // Logs staff
      const logEmbed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🚨 LOG DE BANNISSEMENT')
        .addFields(
          { name: '🆔 Dossier', value: caseId },
          { name: '👤 Utilisateur', value: `${member.user.tag} (${member.id})` },
          { name: '👮 Modérateur', value: `${message.author.tag} (${message.author.id})` },
          { name: '📅 Compte créé', value: createdAt },
          { name: '📥 Arrivé serveur', value: joinedAt },
          { name: '🎭 Rôles', value: roles },
          { name: '📝 Raison', value: reason }
        )
        .setTimestamp();

      const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel?.isTextBased()) {
        logChannel.send({ embeds: [logEmbed] });
      }

    } catch (err) {
      console.error('Erreur ban:', err);
      message.reply('❌ Erreur critique lors du bannissement.');
    }
  }
};
