import fs from 'fs';

const FILE = './data/annonces.json';

function loadData() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export default {
  name: 'annonce',
  description: 'Envoyer une annonce enregistrée',
  permissions: ['Administrator'],
  args: true,
  usage: '<message>',

  async execute(message, args) {
    const content = args.join(' ');
    if (!content) return message.reply('❌ Message manquant.');

    const annonces = loadData();

    annonces.push({
      message: content,
      author: message.author.tag,
      date: new Date().toLocaleString('fr-FR')
    });

    saveData(annonces);

    await message.channel.send(`📢 **ANNONCE**\n${content}`);
    await message.reply('✅ Annonce envoyée et sauvegardée.');
  }
};
