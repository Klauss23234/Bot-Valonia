import fs from 'fs';
import { PermissionsBitField } from 'discord.js';

const DATA_FILE = './antilink.json';

function getData() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ channels: [] }, null, 2));
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export default {
  name: 'antilink',
  usage: 'on | off | list',
  permissions: [PermissionsBitField.Flags.ManageChannels],

  execute(message, args) {
    const action = args[0]?.toLowerCase();
    const data = getData();

    if (!action || !['on', 'off', 'list'].includes(action)) {
      return message.reply('❌ Utilisation : `+antilink on | off | list`')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }

    if (action === 'on') {
      if (!data.channels.includes(message.channel.id)) data.channels.push(message.channel.id);
      saveData(data);
      return message.reply(`✅ Anti‑lien activé dans ${message.channel}`)
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }

    if (action === 'off') {
      data.channels = data.channels.filter(id => id !== message.channel.id);
      saveData(data);
      return message.reply(`❌ Anti‑lien désactivé dans ${message.channel}`)
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }

    if (action === 'list') {
      if (data.channels.length === 0) {
        return message.reply('ℹ️ Aucun salon avec anti‑lien actif.')
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
      }

      const list = data.channels.map(id => `<#${id}>`).join('\n');
      return message.reply(`📌 Salons avec anti‑lien actif :\n${list}`)
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }
  }
};
