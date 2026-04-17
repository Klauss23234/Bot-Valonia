import { EmbedBuilder } from 'discord.js';

export default {
  name: 'boostslist',
  description: 'Affiche la liste complète de tous les boosters',
  aliases: ['boostlist', 'listboosts', 'allboosters'],

  async execute(message, args, client) {
    const guild = message.guild;

    await guild.members.fetch();

    const boosters = guild.members.cache.filter(member => member.premiumSince);

    if (boosters.size === 0) {
      return message.reply('❌ Ce serveur n\'a aucun booster pour le moment.');
    }

    const sortedBoosters = boosters.sort((a, b) => a.premiumSince - b.premiumSince);

    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount || 0;

    const levelEmojis = {
      0: '⚪',
      1: '🔵',
      2: '💜',
      3: '💎'
    };

    const levelEmoji = levelEmojis[boostLevel] || '⚪';

    const embed = new EmbedBuilder()
      .setTitle(`${levelEmoji} Liste complète des boosters`)
      .setColor(boostLevel === 0 ? '#99AAB5' : boostLevel === 1 ? '#5865F2' : boostLevel === 2 ? '#A06FD2' : '#ED4245')
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .setDescription(`**${boosters.size} boosters** • **${boostCount} boosts** • **Niveau ${boostLevel}**`)
      .setFooter({ text: `Serveur de ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    // Créer la liste complète
    const boosterList = sortedBoosters.map((member, index) => {
      const timeBoost = getTimeSince(member.premiumSince);
      
      // Médailles pour le top 3
      let medal = '';
      if (index === 0) medal = '🥇 ';
      else if (index === 1) medal = '🥈 ';
      else if (index === 2) medal = '🥉 ';
      
      return `${medal}**${index + 1}.** ${member.user.tag} - *${timeBoost}*`;
    }).join('\n');

    // Découper si trop long (Discord limite à 1024 caractères par field)
    if (boosterList.length > 1024) {
      const chunks = boosterList.match(/[\s\S]{1,1000}/g) || [];
      chunks.forEach((chunk, i) => {
        embed.addFields({
          name: i === 0 ? '📋 Boosters' : '\u200b',
          value: chunk,
          inline: false
        });
      });
    } else {
      embed.addFields({
        name: '📋 Boosters',
        value: boosterList,
        inline: false
      });
    }

    return message.reply({ embeds: [embed] });
  }
};

function getTimeSince(date) {
  const now = new Date();
  const diff = now - date;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} an${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} mois`;
  if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
  return 'Aujourd\'hui';
}