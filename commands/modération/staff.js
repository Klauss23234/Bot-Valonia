export default {
  name: 'nomdelacommande',
  description: 'Description claire',
  aliases: [],
  permissions: [],
  args: false,
  usage: '',

 
  async execute(message) {
    message.reply(
      `🛡️ **STAFF HUB**\n\n` +
      `📢 Annonces : \`+announce <message>\`\n` +
      `📝 Notes : \`+note @membre <texte>\`\n` +
      `📄 Voir notes : \`+notes @membre\`\n` +
      `📅 Réunion : \`+meeting <info>\`\n` +
      `📁 Salon temporaire : \`+tempchannel <nom>\`\n`
    );
  }
};
