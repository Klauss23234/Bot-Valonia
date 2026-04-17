import { PermissionFlagsBits } from 'discord.js';
import fs from 'fs';

const WARNS_FILE = './data/warns.json';

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

if (!fs.existsSync(WARNS_FILE)) {
  fs.writeFileSync(WARNS_FILE, JSON.stringify({}, null, 2));
}

function loadWarns() {
  const data = fs.readFileSync(WARNS_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveWarns(data) {
  fs.writeFileSync(WARNS_FILE, JSON.stringify(data, null, 2));
}

export default {
  name: 'warn',
  description: 'Système de warns (avertissements)',
  aliases: ['warns', 'unwarn'],
  permissions: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args, client) {
    const command = message.content.slice(client.config.prefix.length).trim().split(/ +/)[0].toLowerCase();

    // WARN
    if (command === 'warn') {
      const user = message.mentions.users.first();
      const reason = args.slice(1).join(' ');

      if (!user) {
        return message.reply('❌ Usage: `+warn @user raison`');
      }

      if (!reason) {
        return message.reply('❌ Tu dois spécifier une raison !');
      }

      if (user.id === message.author.id) {
        return message.reply('❌ Tu ne peux pas te warn toi-même !');
      }

      if (user.bot) {
        return message.reply('❌ Tu ne peux pas warn un bot !');
      }

      const member = message.guild.members.cache.get(user.id);
      if (member && member.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply('❌ Tu ne peux pas warn ce membre (rôle supérieur ou égal) !');
      }

      const warns = loadWarns();
      const guildId = message.guild.id;
      const userId = user.id;

      if (!warns[guildId]) warns[guildId] = {};
      if (!warns[guildId][userId]) warns[guildId][userId] = [];

      const warnId = Date.now().toString();
      const warnData = {
        id: warnId,
        reason: reason,
        moderator: message.author.tag,
        moderatorId: message.author.id,
        date: new Date().toISOString()
      };

      warns[guildId][userId].push(warnData);
      saveWarns(warns);

      const warnCount = warns[guildId][userId].length;

      try {
        await user.send(`⚠️ Tu as été averti sur **${message.guild.name}**\n**Raison:** ${reason}\n**Warns totaux:** ${warnCount}`);
      } catch (error) {
        // DM fermés
      }

      return message.reply(`✅ **${user.tag}** a été averti !\n**Raison:** ${reason}\n**Warns totaux:** ${warnCount}\n**ID du warn:** \`${warnId}\``);
    }

    // WARNS
    if (command === 'warns') {
      const user = message.mentions.users.first() || message.author;

      const warns = loadWarns();
      const guildId = message.guild.id;
      const userId = user.id;

      if (!warns[guildId] || !warns[guildId][userId] || warns[guildId][userId].length === 0) {
        return message.reply(`✅ **${user.tag}** n'a aucun warn.`);
      }

      const userWarns = warns[guildId][userId];
      const warnList = userWarns.map((w, index) => {
        const date = new Date(w.date).toLocaleDateString('fr-FR');
        return `**${index + 1}.** [ID: \`${w.id}\`]\n**Raison:** ${w.reason}\n**Par:** ${w.moderator}\n**Date:** ${date}`;
      }).join('\n\n');

      return message.reply(`⚠️ **Warns de ${user.tag}** (${userWarns.length} total)\n\n${warnList}`);
    }

    // UNWARN
    if (command === 'unwarn') {
      const user = message.mentions.users.first();
      const warnId = args[1];

      if (!user || !warnId) {
        return message.reply('❌ Usage: `+unwarn @user ID_WARN`');
      }

      const warns = loadWarns();
      const guildId = message.guild.id;
      const userId = user.id;

      if (!warns[guildId] || !warns[guildId][userId] || warns[guildId][userId].length === 0) {
        return message.reply(`❌ **${user.tag}** n'a aucun warn.`);
      }

      const warnIndex = warns[guildId][userId].findIndex(w => w.id === warnId);

      if (warnIndex === -1) {
        return message.reply('❌ Warn introuvable ! Vérifie l\'ID avec `+warns @user`');
      }

      const removedWarn = warns[guildId][userId][warnIndex];
      warns[guildId][userId].splice(warnIndex, 1);

      if (warns[guildId][userId].length === 0) {
        delete warns[guildId][userId];
      }

      saveWarns(warns);

      return message.reply(`✅ Warn retiré de **${user.tag}** !\n**Raison du warn:** ${removedWarn.reason}`);
    }
  }
};