import fs from 'fs';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';

const DATA_FILE = './service.json';

// Récupération des données
function getServiceData() {
  if (!fs.existsSync(DATA_FILE))
    fs.writeFileSync(DATA_FILE, JSON.stringify({ staff: [] }, null, 2));
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Sauvegarde
function saveServiceData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export default {
  name: 'service',
  usage: '<start|pause|end|list>',
  permissions: [],

  async execute(message, args) {
    // ✅ Rôles staff avec leurs IDs exacts
    const staffRoleIds = [
      '1409519868780351509', // 🤝➤ DUO
      '1409519869589721118', // 💪 ➤ BROTHERS
      '1409519874056912987', // 🛠️ ➤ STAFF
    ];

    const member = message.member;

    // Vérification si membre est staff
    if (!member.roles.cache.some(r => staffRoleIds.includes(r.id))) {
      return message.reply('❌ Tu n’es pas autorisé à utiliser cette commande.');
    }

    const data = getServiceData();
    const subCommand = args[0]?.toLowerCase();

    if (!subCommand || !['start', 'pause', 'end', 'list'].includes(subCommand)) {
      return message.reply('❌ Sous-commande invalide. Utilise : start, pause, end, list');
    }

    const existing = data.staff.find(s => s.userId === member.id);

    // 🔹 Début de service
    if (subCommand === 'start') {
      if (existing && existing.status === 'en service')
        return message.reply('⚠️ Tu es déjà en service.');

      if (existing) existing.status = 'en service';
      else data.staff.push({ userId: member.id, status: 'en service' });

      saveServiceData(data);

      const embed = new EmbedBuilder()
        .setTitle('🟢 Début de service')
        .setDescription(`${member} est maintenant **en service**`)
        .setColor('Green')
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // 🔹 Pause
    if (subCommand === 'pause') {
      if (!existing || existing.status !== 'en service')
        return message.reply('⚠️ Tu n’es pas en service.');

      existing.status = 'en pause';
      saveServiceData(data);

      const embed = new EmbedBuilder()
        .setTitle('🟡 Pause')
        .setDescription(`${member} est maintenant en **pause**`)
        .setColor('Yellow')
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // 🔹 Fin de service
    if (subCommand === 'end') {
      if (!existing || existing.status === 'fin')
        return message.reply('⚠️ Tu n’étais pas en service.');

      existing.status = 'fin';
      saveServiceData(data);

      const embed = new EmbedBuilder()
        .setTitle('🔴 Fin de service')
        .setDescription(`${member} a terminé son service`)
        .setColor('Red')
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // 🔹 Liste du staff
    if (subCommand === 'list') {
      const activeStaff = data.staff.filter(s => s.status !== 'fin');

      if (!activeStaff.length) {
        return message.channel.send('Aucun membre du staff en service.');
      }

      const lines = activeStaff
        .map(s => {
          const m = message.guild.members.cache.get(s.userId);
          return m ? `${m} - ${s.status}` : null;
        })
        .filter(Boolean);

      const embed = new EmbedBuilder()
        .setTitle('📋 Staff en service')
        .setDescription(lines.length ? lines.join('\n') : 'Aucun membre en service.')
        .setColor('Blue')
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }
  },
};
