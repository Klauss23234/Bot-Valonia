import { PermissionsBitField, ChannelType } from 'discord.js';
import fs from 'fs';

const OWNER_ID = '1006595866469093396';
const BACKUP_FILE = './data/nuke_backup.json';
const SAFE_DELAY = 1500;

let panicStop = false;
let currentName = '💥-nuked';
let customPingMessage = '@everyone'; // Message par défaut pour les pings

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default {
  name: 'nuke',
  description: 'Gestion des nukes du serveur',
  category: 'Staff',

  async execute(message, args) {
    if (message.author.id !== OWNER_ID) return;

    const sub = (args[0] || '').toLowerCase();

    if (!sub) {
      return message.reply('❌ Sous-commande manquante (`nuke help`)');
    }

    switch (sub) {

      // =====================
      // PANIC STOP
      // =====================
      case 'panic': {
        if (args[1] === 'stop') {
          panicStop = true;
          return message.reply('🛑 **PANIC STOP ACTIVÉ**');
        }
        return message.reply('❌ Usage : `+nuke panic stop`');
      }

      // =====================
      // PREVIEW
      // =====================
      case 'preview':
        return message.reply(`👀 Nom actuel : **${currentName}**`);

      // =====================
      // STATUS
      // =====================
      case 'status':
        return message.reply(
          fs.existsSync(BACKUP_FILE)
            ? '✅ Backup disponible'
            : '❌ Aucun backup'
        );

      // =====================
      // CUSTOM NAME
      // =====================
      case 'custom': {
        const name = args.slice(1).join(' ');
        if (!name) return message.reply('Usage : `+nuke custom <nom>`');
        currentName = name;
        return message.reply(`✅ Nom défini : **${currentName}**`);
      }

      // =====================
      // RESTORE
      // =====================
      case 'restore': {
        if (!fs.existsSync(BACKUP_FILE)) {
          return message.reply('❌ Aucun backup.');
        }

        const backup = JSON.parse(fs.readFileSync(BACKUP_FILE));
        let restored = 0;

        for (const ch of message.guild.channels.cache.values()) {
          if (!ch.manageable || !backup[ch.id]) continue;
          await ch.setName(backup[ch.id]).catch(() => {});
          restored++;
          await sleep(500);
        }

        return message.reply(`✅ **${restored} salons restaurés**`);
      }

      // =====================
      // NUKE RUN / SAFE
      // =====================
      case 'run':
      case 'safe': {
        panicStop = false;

        const backup = {};
        for (const ch of message.guild.channels.cache.values()) {
          backup[ch.id] = ch.name;
        }

        fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));

        const safe = sub === 'safe';
        await message.reply(
          safe ? '⚠️ **NUKE SAFE lancé**' : '⚠️ **NUKE RAPIDE lancé**'
        );

        let renamed = 0;
        for (const ch of message.guild.channels.cache.values()) {
          if (panicStop) break;
          if (!ch.manageable) continue;

          await ch.setName(currentName).catch(() => {});
          renamed++;
          if (safe) await sleep(SAFE_DELAY);
        }

        if (panicStop) {
          return message.reply('🛑 **NUKE ARRÊTÉ**');
        }

        return message.reply(`💥 **${renamed} salons renommés**`);
      }

      // =====================
      // MASS PING (@everyone ou personnalisé)
      // =====================
      case 'ping':
      case 'massping': {
        panicStop = false;
        await message.reply('📢 **Mass ping en cours…**');

        let pinged = 0;

        for (const ch of message.guild.channels.cache.values()) {
          if (panicStop) break;

          if (
            ch.type === ChannelType.GuildText &&
            ch.permissionsFor(message.guild.members.me)
              ?.has(PermissionsBitField.Flags.SendMessages)
          ) {
            try {
              await ch.send(customPingMessage);
              pinged++;
              await sleep(1200);
            } catch {}
          }
        }

        if (panicStop) {
          return message.reply('🛑 **PING ARRÊTÉ**');
        }

        return message.reply(`✅ **Message envoyé dans ${pinged} salons**`);
      }

      // =====================
      // CUSTOM PING MESSAGE
      // =====================
      case 'setping': {
        const msg = args.slice(1).join(' ');
        if (!msg) return message.reply('Usage : `+nuke setping <texte>`');
        customPingMessage = msg;
        return message.reply(`✅ Message de ping défini : **${customPingMessage}**`);
      }

      // =====================
      // STOP MASS PING
      // =====================
      case 'stoppingping': {
        panicStop = true;
        return message.reply('🛑 **MASS PING ARRÊTÉ**');
      }

      // =====================
      // HELP
      // =====================
      case 'help':
        return message.reply('📘 Liste des commandes en bas du fichier `nuke.js`');

      default:
        return message.reply('❌ Sous-commande inconnue (`nuke help`)');
    }
  }
};

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💥 COMMANDES NUKE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Nukes
- +nuke run
- +nuke safe
- +nuke restore
- +nuke custom <nom>
- +nuke preview
- +nuke status

📢 Ping massif
- +nuke ping
- +nuke massping
- +nuke setping <texte>  -> définir le message de ping
- +nuke stoppingping      -> arrêter le ping en cours

🛑 Sécurité
- +nuke panic stop

ℹ️ Info
- +nuke help

🔐 OWNER ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
