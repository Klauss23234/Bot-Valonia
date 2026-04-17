import { EmbedBuilder } from 'discord.js';

export default {
  name: 'boosts',
  description: 'Affiche les informations détaillées sur les boosts du serveur',
  aliases: ['boosters', 'boostlist', 'boostinfo'],

  async execute(message, args, client) {
    const guild = message.guild;

    // Récupérer tous les membres
    await guild.members.fetch();

    // Filtrer les boosters
    const boosters = guild.members.cache.filter(member => member.premiumSince);

    // Informations sur les boosts
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount || 0;

    // Emojis pour les niveaux
    const levelEmojis = {
      0: '⚪',
      1: '🔵',
      2: '💜',
      3: '💎'
    };

    const levelEmoji = levelEmojis[boostLevel] || '⚪';

    // Calcul pour le prochain niveau
    let nextLevelInfo = '';
    let progressBar = '';
    let percentage = 0;

    if (boostLevel === 0) {
      const needed = 2 - boostCount;
      percentage = Math.floor((boostCount / 2) * 100);
      nextLevelInfo = `${needed} boost(s) pour le niveau 1`;
      progressBar = createProgressBar(boostCount, 2);
    } else if (boostLevel === 1) {
      const needed = 7 - boostCount;
      percentage = Math.floor((boostCount / 7) * 100);
      nextLevelInfo = `${needed} boost(s) pour le niveau 2`;
      progressBar = createProgressBar(boostCount, 7);
    } else if (boostLevel === 2) {
      const needed = 14 - boostCount;
      percentage = Math.floor((boostCount / 14) * 100);
      nextLevelInfo = `${needed} boost(s) pour le niveau 3`;
      progressBar = createProgressBar(boostCount, 14);
    } else if (boostLevel === 3) {
      nextLevelInfo = 'Niveau maximum atteint !';
      progressBar = '█████████████████████ 100%';
      percentage = 100;
    }

    // Créer l'embed principal
    const embed = new EmbedBuilder()
      .setTitle(`${levelEmoji} Boosts du serveur`)
      .setColor(boostLevel === 0 ? '#99AAB5' : boostLevel === 1 ? '#5865F2' : boostLevel === 2 ? '#A06FD2' : '#ED4245')
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: '📊 Statistiques',
          value: `**Niveau actuel:** ${boostLevel} ${levelEmoji}\n**Boosts actifs:** ${boostCount}\n**Boosters:** ${boosters.size}`,
          inline: true
        },
        {
          name: '🎯 Progression',
          value: `${progressBar}\n${nextLevelInfo}`,
          inline: false
        }
      )
      .setFooter({ text: `Serveur de ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    // Si pas de boosters
    if (boosters.size === 0) {
      embed.setDescription('❌ Ce serveur n\'a aucun booster pour le moment.\n\n💡 *Soyez le premier à booster le serveur !*');
      return message.reply({ embeds: [embed] });
    }

    // Trier les boosters par ancienneté
    const sortedBoosters = boosters.sort((a, b) => a.premiumSince - b.premiumSince);

    // Top 3 boosters (les plus anciens)
    const top3 = sortedBoosters.first(3);
    const medals = ['🥇', '🥈', '🥉'];

    const top3List = top3.map((member, index) => {
      const boostDate = member.premiumSince;
      const timeBoost = getTimeSince(boostDate);
      return `${medals[index]} **${member.user.tag}** - *${timeBoost}*`;
    }).join('\n');

    embed.addFields({
      name: '🏆 Top 3 Boosters',
      value: top3List || 'Aucun',
      inline: false
    });

    // Liste complète des boosters (si demandé avec un argument)
    if (args[0] === 'list' || args[0] === 'all') {
      const boosterList = sortedBoosters.map((member, index) => {
        const timeBoost = getTimeSince(member.premiumSince);
        return `**${index + 1}.** ${member.user.tag} - *${timeBoost}*`;
      }).join('\n');

      // Découper si trop long
      if (boosterList.length > 1024) {
        const chunks = boosterList.match(/[\s\S]{1,1000}/g) || [];
        chunks.forEach((chunk, i) => {
          embed.addFields({
            name: i === 0 ? '📋 Liste complète' : '\u200b',
            value: chunk,
            inline: false
          });
        });
      } else {
        embed.addFields({
          name: '📋 Liste complète',
          value: boosterList,
          inline: false
        });
      }
    } else {
      embed.setDescription(`*Utilise \`+boosts list\` pour voir la liste complète des ${boosters.size} boosters*`);
    }

    // Avantages selon le niveau
    const perks = getBoostPerks(boostLevel);
    if (perks) {
      embed.addFields({
        name: '✨ Avantages débloqués',
        value: perks,
        inline: false
      });
    }

    return message.reply({ embeds: [embed] });
  }
};

// Fonction pour créer une barre de progression
function createProgressBar(current, max) {
  const percentage = Math.floor((current / max) * 100);
  const filledBars = Math.floor((current / max) * 20);
  const emptyBars = 20 - filledBars;
  
  const bar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
  return `${bar} ${percentage}%`;
}

// Fonction pour calculer le temps écoulé
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

// Fonction pour afficher les avantages
function getBoostPerks(level) {
  const perks = {
    0: null,
    1: '• 50 emojis personnalisés\n• 128 Kbps audio\n• Bannière de serveur\n• Icône du serveur animée',
    2: '• 150 emojis personnalisés\n• 256 Kbps audio\n• URL personnalisée\n• Limite d\'upload 50MB\n• Écran de bienvenue personnalisé',
    3: '• 250 emojis personnalisés\n• 384 Kbps audio\n• Limite d\'upload 100MB\n• URL vanity personnalisée\n• Bannière animée'
  };
  
  return perks[level];
}