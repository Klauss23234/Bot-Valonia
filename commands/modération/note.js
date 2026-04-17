import fs from 'fs';

const FILE = './data/staff_notes.json';

export default {
  name: 'note',
  description: 'Ajouter une note staff à un membre',
  permissions: ['ModerateMembers'],
  args: true,
  usage: '@membre <note>',

  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Mentionne un membre.');

    const note = args.slice(1).join(' ');
    if (!note) return message.reply('❌ Note manquante.');

    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');
    const data = JSON.parse(fs.readFileSync(FILE));

    if (!data[member.id]) data[member.id] = [];

    data[member.id].push({
      note,
      author: message.author.tag,
      date: new Date().toLocaleString('fr-FR')
    });

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    message.reply(`✅ Note ajoutée pour ${member.user.tag}`);
  }
};
