export default {
  name: 'pression',
  execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Mentionne quelqu’un.');
    }

    const messages = [
      `⚠️ ${member}, dernière chance…`,
      `🚨 ${member} est désormais sous surveillance.`,
      `⏳ ${member}, le temps joue contre toi.`,
      `📸 ${member}, tout est noté.`
    ];

    const random = messages[Math.floor(Math.random() * messages.length)];
    message.channel.send(random);
  }
};
