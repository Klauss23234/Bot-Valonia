import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} from 'discord.js';

export default {
  name: 'sondage',
  description: 'Crée un sondage avancé avec boutons et résultats en temps réel',
  aliases: ['poll', 'pollv2', 'poll-advanced'],
  usage: '<durée> <question> | <option1> | <option2> | ...',
  args: true,
  permissions: [PermissionFlagsBits.ManageMessages],

  async execute(message, args, client) {

    /* =======================
       VALIDATION DES ARGUMENTS
    ======================= */

    if (!args.length || !args[0]) {
      return message.reply(
        '❌ Tu dois spécifier une durée.\nExemple : `+sondage 1h Question | Option1 | Option2`'
      );
    }

    const durationArg = args[0];
    const timeMatch = durationArg.match(/^(\d+)([smhd])$/);

    if (!timeMatch) {
      return message.reply(
        '❌ Durée invalide.\nFormats acceptés : `10s`, `5m`, `2h`, `1d`'
      );
    }

    const timeValue = parseInt(timeMatch[1], 10);
    const timeUnit = timeMatch[2];

    const multipliers = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000
    };

    const duration = timeValue * multipliers[timeUnit];

    const durationText = {
      s: `${timeValue} seconde(s)`,
      m: `${timeValue} minute(s)`,
      h: `${timeValue} heure(s)`,
      d: `${timeValue} jour(s)`
    }[timeUnit];

    /* =======================
       QUESTION & OPTIONS
    ======================= */

    const input = args
      .slice(1)
      .join(' ')
      .split('|')
      .map(s => s.trim())
      .filter(Boolean);

    if (input.length < 3) {
      return message.reply(
        '❌ Format invalide.\nExemple : `+sondage 1h Question | Option1 | Option2`'
      );
    }

    const question = input[0];
    const options = input.slice(1);

    if (options.length > 10) {
      return message.reply('❌ Maximum 10 options autorisées.');
    }

    /* =======================
       INITIALISATION
    ======================= */

    const endTime = Date.now() + duration;
    const votes = {};
    const voters = new Set();

    options.forEach((_, i) => {
      votes[i] = { count: 0, voters: new Set() };
    });

    /* =======================
       EMBED
    ======================= */

    const createEmbed = () => {
      const totalVotes = Object.values(votes).reduce((a, b) => a + b.count, 0);

      let resultsText = '';
      options.forEach((opt, i) => {
        const count = votes[i].count;
        const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
        const barLength = Math.round(percent / 5);
        const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);

        resultsText += `\n**${i + 1}.** ${opt}\n\`${bar}\` ${percent}% (${count} vote${count !== 1 ? 's' : ''})\n`;
      });

      return new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${question}`)
        .setDescription(resultsText || '*Aucun vote pour le moment*')
        .addFields(
          { name: '⏱️ Se termine', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true },
          { name: '👥 Votants', value: `${voters.size}`, inline: true }
        )
        .setFooter({ text: `Créé par ${message.author.tag} • Durée : ${durationText}` })
        .setTimestamp(endTime);
    };

    /* =======================
       BOUTONS
    ======================= */

    const createButtons = () => {
      const rows = [];
      for (let i = 0; i < options.length; i += 5) {
        const row = new ActionRowBuilder();
        for (let j = i; j < Math.min(i + 5, options.length); j++) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`poll_${j}`)
              .setLabel(`${j + 1}`)
              .setStyle(ButtonStyle.Primary)
          );
        }
        rows.push(row);
      }
      return rows;
    };

    /* =======================
       ENVOI
    ======================= */

    await message.delete().catch(() => {});
    const pollMsg = await message.channel.send({
      embeds: [createEmbed()],
      components: createButtons()
    });

    const collector = pollMsg.createMessageComponentCollector({ time: duration });

    /* =======================
       VOTES
    ======================= */

    collector.on('collect', async interaction => {
      const index = Number(interaction.customId.split('_')[1]);

      if (voters.has(interaction.user.id)) {
        for (const data of Object.values(votes)) {
          if (data.voters.has(interaction.user.id)) {
            data.voters.delete(interaction.user.id);
            data.count--;
          }
        }
      }

      votes[index].voters.add(interaction.user.id);
      votes[index].count++;
      voters.add(interaction.user.id);

      await interaction.update({ embeds: [createEmbed()] });
    });

    /* =======================
       FIN
    ======================= */

    collector.on('end', async () => {
      const totalVotes = Object.values(votes).reduce((a, b) => a + b.count, 0);

      if (!totalVotes) {
        return pollMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle(`📊 ${question}`)
              .setDescription('❌ Aucun vote enregistré.')
              .setFooter({ text: 'Sondage terminé' })
              .setTimestamp()
          ],
          components: []
        });
      }

      let maxVotes = 0;
      let winners = [];

      options.forEach((_, i) => {
        if (votes[i].count > maxVotes) {
          maxVotes = votes[i].count;
          winners = [i];
        } else if (votes[i].count === maxVotes) {
          winners.push(i);
        }
      });

      const winnerText =
        winners.length === 1
          ? `🏆 **Gagnant :** ${options[winners[0]]} (${maxVotes} votes)`
          : `🏆 **Égalité :** ${winners.map(i => options[i]).join(', ')} (${maxVotes} votes chacun)`;

      let resultsText = '';
      options.forEach((opt, i) => {
        const count = votes[i].count;
        const percent = Math.round((count / totalVotes) * 100);
        const barLength = Math.round(percent / 5);
        const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
        const trophy = winners.includes(i) ? '🏆 ' : '';

        resultsText += `\n${trophy}**${i + 1}.** ${opt}\n\`${bar}\` ${percent}% (${count} vote${count !== 1 ? 's' : ''})\n`;
      });

      await pollMsg.edit({
        embeds: [
          new EmbedBuilder()
            .setColor('#57F287')
            .setTitle(`📊 ${question} — Terminé`)
            .setDescription(resultsText)
            .addFields(
              { name: '👥 Votants', value: `${voters.size}`, inline: true },
              { name: '\u200b', value: winnerText }
            )
            .setFooter({ text: 'Sondage terminé' })
            .setTimestamp()
        ],
        components: []
      });
    });
  }
};
