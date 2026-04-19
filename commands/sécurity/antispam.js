export default {
  name: 'antispam',
  description: 'Active ou désactive l’anti-spam',
  permissions: ['ManageGuild'],

  async execute(message, args) {
    if (!args[0] || !['on', 'off'].includes(args[0])) {
      return message.reply('❌ Utilisation : `+antispam on/off`');
    }

    global.antiSpam = args[0] === 'on';

    message.reply(
      global.antiSpam
        ? '🛡️ Anti-spam **ACTIVÉ**'
        : '❌ Anti-spam **DÉSACTIVÉ**'
    );
  }
};


// +antispam on
// +antispam off

