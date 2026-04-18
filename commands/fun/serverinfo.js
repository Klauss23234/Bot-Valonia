import { EmbedBuilder } from 'discord.js';

export default {
  name: 'serverinfo',
  description: 'Affiche les informations du serveur',
  aliases: ['si', 'server', 'guildinfo'],
  async execute(message) {
    const guild = message.guild;

    // Fetch complet pour avoir toutes les données à jour
    await guild.members.fetch();

    // Compteurs
    const totalMembers = guild.memberCount;
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    // Statuts
    const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
    const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
    const offline = totalMembers - online - idle - dnd;

    // Compteurs de salons
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;
    const threads = guild.channels.cache.filter(c => c.isThread()).size;

    // Boosts
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount || 0;

    // Niveau de vérification
    const verificationLevels = {
      0: 'Aucune',
      1: 'Faible',
      2: 'Moyen',
      3: 'Élevé',
      4: 'Très élevé'
    };

    // Propriétaire
    const owner = await guild.fetchOwner();

    // Création de l'embed
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
      .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
      .addFields(
        {
          name: '📊 Informations générales',
          value: `**ID:** \`${guild.id}\`\n**Propriétaire:** ${owner.user.tag}\n**Créé le:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n*Il y a <t:${Math.floor(guild.createdTimestamp / 1000)}:R>*`,
          inline: false
        },
        {
          name: `👥 Membres [${totalMembers}]`,
          value: `👤 Humains: **${humans}**\n🤖 Bots: **${bots}**\n\n🟢 En ligne: **${online}**\n🟡 Inactif: **${idle}**\n🔴 Occupé: **${dnd}**\n⚫ Hors ligne: **${offline}**`,
          inline: true
        },
        {
          name: `📝 Salons [${guild.channels.cache.size}]`,
          value: `💬 Textuels: **${textChannels}**\n🔊 Vocaux: **${voiceChannels}**\n📁 Catégories: **${categories}**\n🧵 Threads: **${threads}**`,
          inline: true
        },
        {
          name: '🎭 Autres',
          value: `**Rôles:** ${guild.roles.cache.size}\n**Emojis:** ${guild.emojis.cache.size}\n**Stickers:** ${guild.stickers.cache.size}`,
          inline: true
        },
        {
          name: '💎 Boost',
          value: `**Niveau:** ${boostLevel} ${['', '⭐', '⭐⭐', '⭐⭐⭐'][boostLevel] || ''}\n**Boosts:** ${boostCount}`,
          inline: true
        },
        {
          name: '🔒 Sécurité',
          value: `**Vérification:** ${verificationLevels[guild.verificationLevel]}\n**Filtre contenu:** ${guild.explicitContentFilter === 0 ? 'Désactivé' : guild.explicitContentFilter === 1 ? 'Sans rôle' : 'Tous'}`,
          inline: true
        }
      )
      .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    // Bannière du serveur si disponible
    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 1024 }));
    }

    // Envoyer l'embed
    message.reply({ embeds: [embed] });
  }
};
