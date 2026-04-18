import { EmbedBuilder } from 'discord.js';
import fs from 'fs';

const STATS_FILE = './data/stats.json';

export default {
  name: 'growth',
  description: 'Croissance des membres',
  aliases: ['croissance'],

  async execute(message, args, client) {
    if (!fs.existsSync(STATS_FILE)) {
      return message.reply('❌ Aucune donnée disponible.');
    }

    const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
    const guildId = message.guild.id;

    if (!stats[guildId]?.activity) {
      return message.reply('❌ Aucune donnée de croissance.');
    }

    const activity = stats[guildId].activity.slice(-30);

    if (activity.length === 0) {
      return message.reply('❌ Pas assez de données.');
    }

    const totalJoins = activity.reduce((sum, day) => sum + day.joins, 0);
    const avgJoins = (totalJoins / activity.length).toFixed(1);

    const maxJoins = Math.max(...activity.map(d => d.joins), 1);
    const chart = activity.slice(-14).map(day => {
      const height = Math.floor((day.joins / maxJoins) * 10);
      const bar = '█'.repeat(height) || '▁';
      const date = new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      return `\`${date}\` ${bar} +${day.joins}`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📈 Croissance des membres')
      .setDescription(`**Derniers 14 jours:**\n${chart}`)
      .addFields(
        { name: '👥 Total (30j)', value: `+${totalJoins}`, inline: true },
        { name: '📊 Moyenne/jour', value: `+${avgJoins}`, inline: true },
        { name: '🎯 Actuels', value: `${message.guild.memberCount}`, inline: true }
      )
      .setColor('#57F287')
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};