export default {
  name: 'ghostping',
  description: 'Ping un rôle puis supprime le message',
  usage: '@role',
  category: 'Fun',

  async execute(message) {
    const role = message.mentions.roles.first();
    if (!role) return message.reply('❌ Mentionne un rôle.');

    const msg = await message.channel.send(
      role.members.map(m => `<@${m.id}>`).join(' ')
    );

    await msg.delete().catch(() => {});
    await message.delete().catch(() => {});
  }
};

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👻 COMMANDES GHOSTPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- +ghostping @role   → Ping tous les membres du rôle sans laisser de trace

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
