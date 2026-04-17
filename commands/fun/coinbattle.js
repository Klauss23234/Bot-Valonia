export default {
  name: 'coinbattle',              // obligatoire
  description: 'Duel pile ou face entre deux membres, le perdant reçoit un rôle temporaire.',
  usage: '@user',
  category: 'Fun',

  async execute(message, args, client) {  // <- args et client si ton loader les fournit
    const opponent = message.mentions.members.first();
    if (!opponent) return message.reply('❌ Mentionne un membre pour le duel.');

    const challenger = message.member;
    if (opponent.id === challenger.id) return message.reply('❌ Tu ne peux pas te battre toi-même !');

    const participants = [challenger, opponent];
    const loser = participants[Math.floor(Math.random() * 2)];
    const winner = participants.find(p => p.id !== loser.id);

    // Rôle temporaire
    const roleName = 'Perdant';
    let role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      role = await message.guild.roles.create({ name: roleName, color: 'RED' });
    }

    await loser.roles.add(role);

    message.channel.send(`🎲 ${winner.user.tag} gagne le duel ! ${loser.user.tag} reçoit le rôle temporaire **${roleName}** pendant 5 minutes.`);

    setTimeout(async () => {
      if (loser.roles.cache.has(role.id)) {
        await loser.roles.remove(role);
        message.channel.send(`⏱️ Le rôle **${roleName}** a été retiré à ${loser.user.tag}.`);
      }
    }, 300000);

    // Optionnel : mettre à jour un leaderboard
    const fs = await import('fs');
    const path = './data/leaderboard.json';
    let data = {};
    if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!data[winner.id]) data[winner.id] = 0;
    data[winner.id] += 1;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }
};
