import fs from 'fs';
import { PermissionsBitField } from 'discord.js';

const DATA_FILE = './antilink.json';

// ----------------------------
// Anti-link
// ----------------------------
function getAntiLinkData() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ channels: [] }, null, 2));
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// ----------------------------
// Variables globales anti-spam
// ----------------------------
if (!global.userMessages) global.userMessages = new Map(); // timestamps messages
if (!global.userWarnings) global.userWarnings = new Map(); // compteur warnings
if (typeof global.antiSpam === 'undefined') global.antiSpam = false;

export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const prefix = client.config.prefix;
    const isCommand = message.content.startsWith(prefix);

    // ------------------------
    // 1️⃣ ANTI-LIEN
    // ------------------------
    const antiLinkData = getAntiLinkData();
    if (antiLinkData.channels.includes(message.channel.id)) {
      const linkRegex = /(https?:\/\/|www\.)/i;
      if (linkRegex.test(message.content)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          try { await message.delete(); } catch {}
          message.channel.send(`⚠️ ${message.author}, les liens sont interdits ici.`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
          return;
        }
      }
    }

    // ------------------------
    // 2️⃣ ANTI-SPAM AVEC WARN & MUTE
    // ------------------------
// ------------------------
// 🛡️ ANTI-SPAM AVANCÉ
// ------------------------
if (global.antiSpam) {

  // Ignore le staff
  if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

  const now = Date.now();
  const LIMIT = 5;        // messages
  const INTERVAL = 6000;  // 6 secondes
  const MUTE_TIME = 10 * 60 * 1000; // 10 minutes

  if (!global.spamData) global.spamData = new Map();

  let data = global.spamData.get(message.author.id) || {
    messages: [],
    warns: 0,
  };

  data.messages = data.messages.filter(t => now - t < INTERVAL);
  data.messages.push(now);

  if (data.messages.length >= LIMIT) {
    data.warns++;

    // Supprime le message spam
    if (message.deletable) await message.delete().catch(() => {});

    // ⚠️ WARN 1 & 2
    if (data.warns < 3) {
      message.channel.send(
        `⚠️ ${message.author}, **warning ${data.warns}/2** : stop le spam.`
      ).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

      try {
        await message.author.send(
          `⚠️ Warning ${data.warns}/2 sur **${message.guild.name}** pour spam.`
        );
      } catch {}

    } 
    // 🔇 MUTE AU 3ᵉ
    else {
      let muteRole = message.guild.roles.cache.find(r => r.name === 'Muted');

      if (!muteRole) {
        muteRole = await message.guild.roles.create({
          name: 'Muted',
          permissions: [],
        });

        for (const channel of message.guild.channels.cache.values()) {
          await channel.permissionOverwrites.edit(muteRole, {
            SendMessages: false,
            Speak: false,
          }).catch(() => {});
        }
      }

      await message.member.roles.add(muteRole).catch(() => {});
      message.channel.send(
        `🔇 ${message.author} a été **mute 10 minutes** pour spam.`
      );

      setTimeout(async () => {
        await message.member.roles.remove(muteRole).catch(() => {});
      }, MUTE_TIME);

      // reset après mute
      data.warns = 0;
    }

    data.messages = [];
  }

  global.spamData.set(message.author.id, data);
}


    // ------------------------
    // 3️⃣ AFK (si tu as le système)
    // ------------------------
    const afkCommand = client.commands.get('afk');
    if (afkCommand?.checkAFK) afkCommand.checkAFK(message);
    if (afkCommand?.removeAFK && !isCommand) afkCommand.removeAFK(message);

    // ------------------------
    // 4️⃣ COMMANDES
    // ------------------------
    if (!isCommand) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find(cmd => cmd.aliases?.includes(commandName));

    if (!command) return;

    // Permissions
    if (command.permissions?.length) {
      if (!message.member.permissions.has(command.permissions)) {
        return message.reply('❌ Tu n’as pas la permission d’utiliser cette commande.')
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
      }
    }

    // Owner only
    if (command.ownerOnly && message.author.id !== client.config.ownerId) {
      return message.reply('❌ Commande réservée au propriétaire.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }

    // Arguments requis
    if (command.args && !args.length) {
      let reply = '❌ Arguments manquants.';
      if (command.usage) reply += `\n📝 Utilisation : \`${prefix}${command.name} ${command.usage}\``;
      return message.reply(reply).then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }

    // Exécution
    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(err);
      message.reply('❌ Erreur lors de l’exécution de la commande.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }
  }
};
