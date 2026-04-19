import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} from 'discord.js';

const giveaways = new Map();

function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

function formatTimeLeft(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}j ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

async function endGiveaway(client, giveawayId) {
  const giveaway = giveaways.get(giveawayId);
  if (!giveaway || giveaway.ended) return;
  giveaway.ended = true;

  try {
    const channel = await client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);
    const participants = [...giveaway.participants];

    const embed = new EmbedBuilder()
      .setTitle(`🎉 ${giveaway.prize}`)
      .setColor('#ED4245')
      .setFooter({ text: `Giveaway terminé • ${giveaway.winners} gagnant(s)` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_join_${giveawayId}`)
        .setLabel(`${participants.length} participants`)
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    if (participants.length === 0) {
      embed.setDescription('😔 Personne n\'a participé au giveaway.\n\n**Pas de gagnant.**');
      await message.edit({ embeds: [embed], components: [row] });
      await channel.send({ content: '😔 Pas assez de participants pour ce giveaway !' });
      return;
    }

    const shuffled = participants.sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, Math.min(giveaway.winners, participants.length));
    const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

    embed.setDescription(
      `🏆 **Gagnant(s) :** ${winnerMentions}\n\n` +
      `📦 **Prix :** ${giveaway.prize}\n` +
      `👥 **Participants :** ${participants.length}\n` +
      `🎟️ **Organisé par :** <@${giveaway.hostId}>`
    );

    await message.edit({ embeds: [embed], components: [row] });
    await channel.send({ content: `🎉 Félicitations ${winnerMentions} ! Vous avez gagné **${giveaway.prize}** !` });

  } catch (err) {
    console.error('[GIVEAWAY END ERROR]', err);
  }

  giveaways.delete(giveawayId);
}

export const giveawayCommand = {
  name: 'giveaway',
  description: 'Lancer un giveaway avec timer et gagnant automatique',
  aliases: ['gw', 'giveway'],

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({ content: '❌ Tu n\'as pas la permission de lancer un giveaway.' });
    }

    if (args.length < 3) {
      return message.reply({
        content: '❌ **Usage :** `+giveaway <durée> <nb_gagnants> <prix>`\n📌 **Exemple :** `+giveaway 10m 1 Nitro Classic`\n⏱️ **Durées :** `s` sec, `m` min, `h` heures, `d` jours'
      });
    }

    const duration = parseDuration(args[0]);
    if (!duration) return message.reply({ content: '❌ Durée invalide. Exemples : `30s`, `10m`, `2h`, `1d`' });

    const winnersCount = parseInt(args[1]);
    if (isNaN(winnersCount) || winnersCount < 1 || winnersCount > 20) {
      return message.reply({ content: '❌ Le nombre de gagnants doit être entre 1 et 20.' });
    }

    const prize = args.slice(2).join(' ');
    const endsAt = Date.now() + duration;
    const giveawayId = `${message.guild.id}_${Date.now()}`;

    const embed = new EmbedBuilder()
      .setTitle(`🎉 ${prize}`)
      .setColor('#57F287')
      .setDescription(
        `Clique sur 🎉 pour participer !\n\n` +
        `⏰ **Fin dans :** ${formatTimeLeft(duration)}\n` +
        `🏆 **Gagnant(s) :** ${winnersCount}\n` +
        `🎟️ **Organisé par :** ${message.author}\n` +
        `👥 **Participants :** 0`
      )
      .setFooter({ text: `Se termine le` })
      .setTimestamp(endsAt);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_join_${giveawayId}`)
        .setLabel('0 participants')
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Success)
    );

    const giveawayMsg = await message.channel.send({ embeds: [embed], components: [row] });
    try { await message.delete(); } catch {}

    giveaways.set(giveawayId, {
      id: giveawayId,
      messageId: giveawayMsg.id,
      channelId: message.channel.id,
      guildId: message.guild.id,
      hostId: message.author.id,
      prize,
      winners: winnersCount,
      endsAt,
      participants: new Set(),
      ended: false
    });

    setTimeout(() => endGiveaway(client, giveawayId), duration);

    const interval = setInterval(async () => {
      const gw = giveaways.get(giveawayId);
      if (!gw || gw.ended) return clearInterval(interval);

      const timeLeft = gw.endsAt - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      try {
        const channel = await client.channels.fetch(gw.channelId);
        const msg = await channel.messages.fetch(gw.messageId);

        const updatedEmbed = new EmbedBuilder()
          .setTitle(`🎉 ${gw.prize}`)
          .setColor('#57F287')
          .setDescription(
            `Clique sur 🎉 pour participer !\n\n` +
            `⏰ **Fin dans :** ${formatTimeLeft(timeLeft)}\n` +
            `🏆 **Gagnant(s) :** ${gw.winners}\n` +
            `🎟️ **Organisé par :** <@${gw.hostId}>\n` +
            `👥 **Participants :** ${gw.participants.size}`
          )
          .setFooter({ text: `Se termine le` })
          .setTimestamp(gw.endsAt);

        const updatedRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`giveaway_join_${giveawayId}`)
            .setLabel(`${gw.participants.size} participants`)
            .setEmoji('🎉')
            .setStyle(ButtonStyle.Success)
        );

        await msg.edit({ embeds: [updatedEmbed], components: [updatedRow] });
      } catch { clearInterval(interval); }
    }, 30000);
  },

  async handleButton(interaction) {
    if (!interaction.customId.startsWith('giveaway_join_')) return false;

    const giveawayId = interaction.customId.replace('giveaway_join_', '');
    const giveaway = giveaways.get(giveawayId);

    if (!giveaway || giveaway.ended) {
      return interaction.reply({ content: '❌ Ce giveaway est terminé ou introuvable.', ephemeral: true });
    }

    const userId = interaction.user.id;
    if (giveaway.participants.has(userId)) {
      giveaway.participants.delete(userId);
      return interaction.reply({ content: '😔 Tu t\'es retiré du giveaway.', ephemeral: true });
    } else {
      giveaway.participants.add(userId);
      return interaction.reply({ content: '🎉 Tu participes au giveaway ! Bonne chance !', ephemeral: true });
    }
  },

  getGiveaways() { return giveaways; }
};

export default giveawayCommand;

// ════════════════════════════════════════
// +greroll <messageId>
// ════════════════════════════════════════

export const grerollCommand = {
  name: 'greroll',
  description: 'Reroll un nouveau gagnant pour un giveaway terminé',
  aliases: ['reroll'],

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.' });
    }

    if (!args[0]) {
      return message.reply({ content: '❌ **Usage :** `+greroll <messageId>`\n📌 Fais un clic droit sur le message du giveaway → Copier l\'identifiant' });
    }

    const messageId = args[0];
    const giveaway = [...giveaways.values()].find(g => g.messageId === messageId);

    if (!giveaway) {
      return message.reply({ content: '❌ Giveaway introuvable. Il est peut-être trop ancien (redémarrage du bot).' });
    }

    const participants = [...giveaway.participants];
    if (participants.length === 0) {
      return message.reply({ content: '😔 Aucun participant enregistré pour ce giveaway.' });
    }

    const newWinners = [...participants]
      .sort(() => Math.random() - 0.5)
      .slice(0, giveaway.winners);

    const winnerMentions = newWinners.map(id => `<@${id}>`).join(', ');

    await message.reply({ content: `🎉 **Reroll !** Nouveau(x) gagnant(s) : ${winnerMentions} ! Félicitations !` });

    try {
      const channel = await client.channels.fetch(giveaway.channelId);
      await channel.send({ content: `🔁 **Reroll** par ${message.author} — Nouveau(x) gagnant(s) : ${winnerMentions} !` });
    } catch {}
  }
};

// ════════════════════════════════════════
// +gend <messageId>
// ════════════════════════════════════════

export const gendCommand = {
  name: 'gend',
  description: 'Terminer un giveaway en cours immédiatement',
  aliases: ['gstop'],

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.' });
    }

    if (!args[0]) {
      return message.reply({ content: '❌ **Usage :** `+gend <messageId>`\n📌 Fais un clic droit sur le message du giveaway → Copier l\'identifiant' });
    }

    const messageId = args[0];
    const giveaway = [...giveaways.values()].find(g => g.messageId === messageId);

    if (!giveaway) {
      return message.reply({ content: '❌ Giveaway introuvable ou déjà terminé.' });
    }

    if (giveaway.ended) {
      return message.reply({ content: '❌ Ce giveaway est déjà terminé.' });
    }

    await message.reply({ content: `⏹️ Giveaway **${giveaway.prize}** terminé manuellement par ${message.author}.` });
    await endGiveaway(client, giveaway.id);
  }
};