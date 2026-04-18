import { EmbedBuilder } from 'discord.js';
import fs from 'fs';

// =========================
// INIT JSON
// =========================
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync('./data/welcome.json')) fs.writeFileSync('./data/welcome.json', '{}');

const readJSON  = (p) => { try { const c = fs.readFileSync(p, 'utf8').trim(); return c ? JSON.parse(c) : {}; } catch { return {}; } };
const writeJSON = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

// =========================
// COMMANDE +welcomeset
// =========================
export default {
  name: 'welcomeset',
  description: 'Configure le système de bienvenue',

  async execute(message, args) {
    if (!message.member.permissions.has('ManageGuild'))
      return message.reply('❌ Permission `ManageGuild` requise.');

    const sub = args[0];

    // +welcomeset on
    if (sub === 'on') {
      const data = readJSON('./data/welcome.json');
      if (!data[message.guild.id]?.channel)
        return message.reply('❌ Définis d\'abord un salon avec `+welcomeset salon #salon`');

      data[message.guild.id].enabled = true;
      writeJSON('./data/welcome.json', data);
      return message.reply('✅ Message de bienvenue **activé** !');
    }

    // +welcomeset off
    if (sub === 'off') {
      const data = readJSON('./data/welcome.json');
      if (!data[message.guild.id]) data[message.guild.id] = {};
      data[message.guild.id].enabled = false;
      writeJSON('./data/welcome.json', data);
      return message.reply('✅ Message de bienvenue **désactivé** !');
    }

    // +welcomeset salon #salon
    if (sub === 'salon') {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel) return message.reply('❌ Mentionne un salon. Ex: `+welcomeset salon #bienvenue`');

      const data = readJSON('./data/welcome.json');
      if (!data[message.guild.id]) data[message.guild.id] = {};
      data[message.guild.id].channel = channel.id;
      data[message.guild.id].enabled = true;
      writeJSON('./data/welcome.json', data);
      return message.reply(`✅ Salon de bienvenue défini sur ${channel} et système **activé** !`);
    }

    // +welcomeset test
    if (sub === 'test') {
      const data = readJSON('./data/welcome.json');
      if (!data[message.guild.id]?.channel)
        return message.reply('❌ Définis d\'abord un salon avec `+welcomeset salon #salon`');

      await sendWelcome(message.member, message.guild);
      return message.reply('✅ Message de test envoyé !');
    }

    // +welcomeset status
    if (sub === 'status') {
      const data  = readJSON('./data/welcome.json');
      const cfg   = data[message.guild.id];
      const embed = new EmbedBuilder()
        .setTitle('⚙️ Config Bienvenue')
        .setColor('#5865F2')
        .addFields(
          { name: '📌 Salon',  value: cfg?.channel ? `<#${cfg.channel}>` : 'Non défini', inline: true },
          { name: '🔘 Statut', value: cfg?.enabled ? '✅ Activé' : '❌ Désactivé',        inline: true }
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    return message.reply([
      '📋 **Usage :**',
      '`+welcomeset salon #salon` — Définit le salon',
      '`+welcomeset on` — Active',
      '`+welcomeset off` — Désactive',
      '`+welcomeset test` — Teste le message',
      '`+welcomeset status` — Voir la config',
    ].join('\n'));
  }
};

// =========================
// FONCTION ENVOI BIENVENUE
// =========================
async function sendWelcome(member, guild) {
  const data = readJSON('./data/welcome.json');
  const cfg  = data[guild.id];

  if (!cfg?.enabled || !cfg?.channel) return;

  const channel = guild.channels.cache.get(cfg.channel);
  if (!channel) return;

  const memberCount = guild.memberCount;
  const accountAge  = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `${member.user.tag} vient de rejoindre !`, iconURL: member.user.displayAvatarURL({ size: 128 }) })
    .setTitle('👋 Bienvenue sur le serveur !')
    .setDescription([
      `Salut ${member} ! On est ravis de t'accueillir sur **${guild.name}** ! 🎉`,
      '',
      '> 📜 Lis les règles pour bien démarrer',
      '> 🎫 Ouvre un ticket si tu as besoin d\'aide',
      '> 🎮 Amuse-toi bien !',
    ].join('\n'))
    .setColor('#5865F2')
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '👤 Membre',      value: `${member}`,          inline: true },
      { name: '🎂 Compte créé', value: accountAge,            inline: true },
      { name: '👥 Membre n°',   value: `**${memberCount}**`, inline: true },
    )
    .setFooter({ text: guild.name, iconURL: guild.iconURL() })
    .setTimestamp();

  await channel.send({
    content: `🎉 Bienvenue sur **${guild.name}** ${member} ! Tu es notre **${memberCount}ème** membre !`,
    embeds: [embed]
  });
}

// =========================
// EVENT guildMemberAdd
// =========================
export const welcomeEvent = {
  name: 'guildMemberAdd',
  once: false,
  execute: (member) => sendWelcome(member, member.guild)
};