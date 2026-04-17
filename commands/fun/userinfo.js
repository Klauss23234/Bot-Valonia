import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'userinfo',
  description: 'Affiche toutes les informations sur un utilisateur',
  aliases: ['ui', 'user', 'whois', 'profil'],
  usage: '[@utilisateur]',
  async execute(message, args, client) {
    const prefix = client.config.prefix;

    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    if (!member) return message.reply('❌ Utilisateur introuvable sur ce serveur.');

    const createdAt = Math.floor(user.createdTimestamp / 1000);
    const joinedAt = Math.floor(member.joinedTimestamp / 1000);

    const members = await message.guild.members.fetch();
    const sorted = members.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    const joinPosition = sorted.map(m => m.id).indexOf(member.id) + 1;

    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString());

    const keyPerms = [];
    if (member.permissions.has(PermissionFlagsBits.Administrator)) keyPerms.push('👑 Administrateur');
    if (member.permissions.has(PermissionFlagsBits.ManageGuild)) keyPerms.push('⚙️ Gérer le serveur');
    if (member.permissions.has(PermissionFlagsBits.ManageRoles)) keyPerms.push('🎭 Gérer les rôles');
    if (member.permissions.has(PermissionFlagsBits.ManageChannels)) keyPerms.push('📝 Gérer les salons');
    if (member.permissions.has(PermissionFlagsBits.KickMembers)) keyPerms.push('👢 Expulser');
    if (member.permissions.has(PermissionFlagsBits.BanMembers)) keyPerms.push('🔨 Bannir');
    if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) keyPerms.push('⏱️ Timeout');

    const badges = [];
    const flags = user.flags?.toArray() || [];
    if (flags.includes('Staff')) badges.push('<:staff:> Staff Discord');
    if (flags.includes('Partner')) badges.push('<:partner:> Partenaire');
    if (flags.includes('Hypesquad')) badges.push('<:hypesquad:> HypeSquad');
    if (flags.includes('BugHunterLevel1')) badges.push('<:bughunter:> Bug Hunter');
    if (flags.includes('BugHunterLevel2')) badges.push('<:bughunter_gold:> Bug Hunter Gold');
    if (flags.includes('PremiumEarlySupporter')) badges.push('<:early:> Early Supporter');
    if (flags.includes('VerifiedDeveloper')) badges.push('<:dev:> Développeur Vérifié');
    if (user.bot) badges.push('🤖 Bot');

    const boostInfo = member.premiumSince
      ? `✨ Booste depuis <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`
      : '❌ Ne booste pas';

    const presence = member.presence;
    const status = presence?.status || 'offline';
    const statusEmoji = {
      online: '🟢',
      idle: '🟡',
      dnd: '🔴',
      offline: '⚫'
    };

    let activities = 'Aucune activité';
    if (presence?.activities.length > 0) {
      activities = presence.activities.map(activity => {
        const type = {
          0: '🎮 Joue à',
          1: '📡 Stream',
          2: '🎵 Écoute',
          3: '📺 Regarde',
          5: '🏆 En compétition'
        };
        return `${type[activity.type] || '📍'} **${activity.name}**${activity.details ? `\n${activity.details}` : ''}`;
      }).join('\n');
    }

    // --- NOUVEAU : LOCALISATION ---
    // Fuseau du serveur + présence sur mobile/desktop
    let devices = [];
    if (presence?.clientStatus) {
      if (presence.clientStatus.web) devices.push('💻 Web');
      if (presence.clientStatus.desktop) devices.push('🖥️ Desktop');
      if (presence.clientStatus.mobile) devices.push('📱 Mobile');
    }
    const locale = message.guild.preferredLocale || 'Inconnu';
    const localisation = `🌐 Serveur: ${locale}\n💠 Appareils: ${devices.join(', ') || 'Aucun'}`;

    // Embed principal
    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor || '#5865F2')
      .setAuthor({
        name: `${user.tag}${user.bot ? ' [BOT]' : ''}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        {
          name: '📊 Informations générales',
          value: `**ID:** \`${user.id}\`\n**Mention:** ${user}\n**Pseudo serveur:** ${member.nickname || 'Aucun'}`,
          inline: false
        },
        {
          name: '📅 Dates',
          value: `**Compte créé:** <t:${createdAt}:F>\n*Il y a <t:${createdAt}:R>*\n\n**Arrivée sur le serveur:** <t:${joinedAt}:F>\n*Il y a <t:${joinedAt}:R>*\n**Position:** ${joinPosition}/${members.size}`,
          inline: false
        },
        {
          name: `🎭 Rôles [${roles.length}]`,
          value: roles.length > 0 ? (roles.length > 10 ? roles.slice(0, 10).join(', ') + ` et ${roles.length - 10} autre(s)...` : roles.join(', ')) : 'Aucun rôle',
          inline: false
        },
        {
          name: '📍 Localisation',
          value: localisation,
          inline: false
        }
      )
      .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    if (keyPerms.length > 0) {
      embed.addFields({
        name: '🔑 Permissions clés',
        value: keyPerms.join('\n'),
        inline: true
      });
    }

    embed.addFields({
      name: '💎 Boost',
      value: boostInfo,
      inline: true
    });

    if (badges.length > 0) {
      embed.addFields({
        name: '🏅 Badges',
        value: badges.join('\n'),
        inline: false
      });
    }

    embed.addFields(
      {
        name: '📡 Statut',
        value: `${statusEmoji[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        inline: true
      },
      {
        name: '🎯 Activité',
        value: activities,
        inline: false
      }
    );

    const fetchedUser = await user.fetch();
    if (fetchedUser.bannerURL()) embed.setImage(fetchedUser.bannerURL({ size: 1024 }));

    message.reply({ embeds: [embed] });
  }
};
