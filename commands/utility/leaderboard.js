import fs from 'fs';

export default {
  name: 'leaderboard',
  description: 'Affiche le classement des victoires au coinbattle.',
  usage: '',
  category: 'Fun',

  execute(message, args) {
    const path = './data/leaderboard.json';
    if (!fs.existsSync(path)) return message.reply('Aucun leaderboard trouvé.');

    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const top10 = sorted.slice(0, 10);

    if (!top10.length) return message.reply('Leaderboard vide.');

    const desc = top10.map(([id, score], i) => `${i + 1}. <@${id}> — ${score} victoire(s)`).join('\n');
    message.channel.send({ content: `🏆 **Leaderboard CoinBattle**\n${desc}` });
  }
};
