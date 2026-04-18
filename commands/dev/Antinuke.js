import { EmbedBuilder, PermissionFlagsBits, AuditLogEvent } from 'discord.js';

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
  enabled:    false,
  logChannel: null,      // ID du salon de logs
  whitelist:  [],        // IDs des membres de confiance (exempt de détection)
  thresholds: {
    channelDelete: { max: 3, window: 5000  },  // 3 suppressions en 5s
    channelCreate: { max: 5, window: 5000  },
    roleDelete:    { max: 3, window: 5000  },
    roleCreate:    { max: 5, window: 5000  },
    memberKick:    { max: 3, window: 5000  },
    memberBan:     { max: 3, window: 5000  },
    webhookCreate: { max: 3, window: 5000  },
    botAdd:        { max: 1, window: 10000 },  // 1 bot ajouté → alerte immédiate
  },
  punishment: 'ban',   // 'ban' | 'kick' | 'strip' (retirer les rôles seulement)
};

// ═══════════════════════════════════════════════════════════════════════════════
//  STATE  —  config & compteurs par guild
// ═══════════════════════════════════════════════════════════════════════════════

/** @type {Map<string, typeof DEFAULT_CONFIG>} */
const configs = new Map();

/** Compteurs d'actions : guildId → userId → action → [timestamps] */
const counters = new Map();

// ─── Helpers config ────────────────────────────────────────────────────────────
function getConfig(guildId) {
  if (!configs.has(guildId)) configs.set(guildId, structuredClone(DEFAULT_CONFIG));
  return configs.get(guildId);
}

// ─── Helpers embeds ────────────────────────────────────────────────────────────
function embedOk(title, description, fields = []) {
  const e = new EmbedBuilder()
    .setColor(0x2ECC71).setTitle(`✅  ${title}`).setTimestamp()
    .setFooter({ text: 'Système Antinuke' });
  if (description) e.setDescription(description);
  if (fields.length) e.addFields(fields);
  return e;
}

function embedErr(description) {
  return new EmbedBuilder()
    .setColor(0xE74C3C).setTitle('❌  Erreur')
    .setDescription(`> ${description}`).setTimestamp()
    .setFooter({ text: 'Système Antinuke' });
}

// ─── Compteur glissant ─────────────────────────────────────────────────────────
function recordAction(guildId, userId, action, windowMs) {
  if (!counters.has(guildId)) counters.set(guildId, new Map());
  const guildMap = counters.get(guildId);
  if (!guildMap.has(userId)) guildMap.set(userId, new Map());
  const userMap = guildMap.get(userId);
  if (!userMap.has(action)) userMap.set(action, []);

  const now = Date.now();
  const timestamps = userMap.get(action).filter(t => now - t < windowMs);
  timestamps.push(now);
  userMap.set(action, timestamps);
  return timestamps.length;
}

// ─── Punition ──────────────────────────────────────────────────────────────────
async function punish(guild, userId, reason, punishment) {
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return;

  // Ne jamais punir le owner
  if (userId === guild.ownerId) return;

  try {
    if (punishment === 'ban') {
      await guild.members.ban(userId, { reason: `[ANTINUKE] ${reason}`, deleteMessageSeconds: 0 });
    } else if (punishment === 'kick') {
      await member.kick(`[ANTINUKE] ${reason}`);
    } else {
      // strip : retire tous les rôles élevés
      const dangerousRoles = member.roles.cache.filter(r =>
        r.permissions.has(PermissionFlagsBits.Administrator) ||
        r.permissions.has(PermissionFlagsBits.ManageGuild) ||
        r.permissions.has(PermissionFlagsBits.BanMembers) ||
        r.permissions.has(PermissionFlagsBits.KickMembers) ||
        r.permissions.has(PermissionFlagsBits.ManageChannels) ||
        r.permissions.has(PermissionFlagsBits.ManageRoles)
      );
      if (dangerousRoles.size) await member.roles.remove(dangerousRoles, `[ANTINUKE] ${reason}`);
    }
  } catch (err) {
    console.error(`[ANTINUKE] Impossible de punir ${userId} :`, err.message);
  }
}

// ─── Log dans le salon dédié ───────────────────────────────────────────────────
async function sendLog(guild, cfg, { action, executor, count, punishment }) {
  if (!cfg.logChannel) return;
  const channel = guild.channels.cache.get(cfg.logChannel);
  if (!channel) return;

  const punishLabel = { ban: '🔨 Banni', kick: '👢 Kické', strip: '🪄 Rôles retirés' };

  const embed = new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle('🚨  Antinuke — Attaque détectée')
    .setDescription(`> Une action suspecte a été **bloquée automatiquement**.`)
    .addFields(
      { name: '‎', value: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**', inline: false },
      { name: '⚡  Action',         value: `> \`${action}\``,                   inline: true },
      { name: '👤  Exécuteur',      value: `> <@${executor}>`,                  inline: true },
      { name: '🔢  Déclenchements', value: `> **${count}** en peu de temps`,    inline: true },
      { name: '⚖️  Sanction',       value: `> ${punishLabel[punishment] ?? punishment}`, inline: true },
      { name: '📅  Date',           value: `> <t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      { name: '‎', value: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**', inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'Système Antinuke' });

  await channel.send({ embeds: [embed] }).catch(() => null);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LISTENER CENTRAL  —  à appeler depuis index.js
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Branche tous les listeners antinuke sur le client Discord.
 * Appelle cette fonction UNE SEULE FOIS au démarrage du bot.
 * @param {import('discord.js').Client} client
 */
export function setupAntinuke(client) {

  // ── Helpers audit log ────────────────────────────────────────────────────────
  async function getExecutor(guild, auditEvent) {
    try {
      await new Promise(r => setTimeout(r, 800)); // petit délai pour que l'audit soit prêt
      const logs = await guild.fetchAuditLogs({ limit: 1, type: auditEvent });
      return logs.entries.first()?.executor?.id ?? null;
    } catch {
      return null;
    }
  }

  async function check(guild, executorId, action, auditEvent) {
    const cfg = getConfig(guild.id);
    if (!cfg.enabled) return;
    if (!executorId) executorId = await getExecutor(guild, auditEvent);
    if (!executorId) return;
    if (executorId === guild.ownerId) return;
    if (cfg.whitelist.includes(executorId)) return;

    const threshold = cfg.thresholds[action];
    if (!threshold) return;

    const count = recordAction(guild.id, executorId, action, threshold.window);
    if (count >= threshold.max) {
      await punish(guild, executorId, `Trop d'actions "${action}" détectées (${count})`, cfg.punishment);
      await sendLog(guild, cfg, { action, executor: executorId, count, punishment: cfg.punishment });
    }
  }

  // ── Suppressions / créations de salons ──────────────────────────────────────
  client.on('channelDelete', async channel => {
    if (!channel.guild) return;
    await check(channel.guild, null, 'channelDelete', AuditLogEvent.ChannelDelete);
  });

  client.on('channelCreate', async channel => {
    if (!channel.guild) return;
    await check(channel.guild, null, 'channelCreate', AuditLogEvent.ChannelCreate);
  });

  // ── Suppressions / créations de rôles ───────────────────────────────────────
  client.on('roleDelete', async role => {
    await check(role.guild, null, 'roleDelete', AuditLogEvent.RoleDelete);
  });

  client.on('roleCreate', async role => {
    await check(role.guild, null, 'roleCreate', AuditLogEvent.RoleCreate);
  });

  // ── Kicks & bans ─────────────────────────────────────────────────────────────
  client.on('guildMemberRemove', async member => {
    const logs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 3000) return;
    if (entry.target?.id !== member.id) return;
    await check(member.guild, entry.executor?.id, 'memberKick', AuditLogEvent.MemberKick);
  });

  client.on('guildBanAdd', async ban => {
    const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd }).catch(() => null);
    const entry = logs?.entries.first();
    await check(ban.guild, entry?.executor?.id, 'memberBan', AuditLogEvent.MemberBanAdd);
  });

  // ── Ajout de bots ─────────────────────────────────────────────────────────────
  client.on('guildMemberAdd', async member => {
    if (!member.user.bot) return;
    const cfg = getConfig(member.guild.id);
    if (!cfg.enabled) return;

    const logs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd }).catch(() => null);
    const entry = logs?.entries.first();
    const executorId = entry?.executor?.id;

    if (!executorId || executorId === member.guild.ownerId) return;
    if (cfg.whitelist.includes(executorId)) return;

    await punish(member.guild, executorId, `Bot ajouté sans autorisation (${member.user.tag})`, cfg.punishment);
    await sendLog(member.guild, cfg, { action: 'botAdd', executor: executorId, count: 1, punishment: cfg.punishment });
  });

  // ── Webhooks ──────────────────────────────────────────────────────────────────
  client.on('webhookUpdate', async channel => {
    if (!channel.guild) return;
    await check(channel.guild, null, 'webhookCreate', AuditLogEvent.WebhookCreate);
  });

  console.log('🛡️ Système Antinuke initialisé.');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMANDE  +antinuke
// ═══════════════════════════════════════════════════════════════════════════════
export default {
  name: 'antinuke',
  aliases: ['an'],
  description: 'Système de protection anti-nuke du serveur',
  usage: '+antinuke <on|off|status|whitelist|unwhitelist|logs|seuil|punishment|help>',
  category: 'Modération',

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ embeds: [embedErr('Permission requise : **Administrator**.')] });
    }

    const sub = args[0]?.toLowerCase();
    const cfg = getConfig(message.guild.id);

    // ── ON ────────────────────────────────────────────────────────────────────
    if (sub === 'on' || sub === 'enable') {
      cfg.enabled = true;
      return message.reply({
        embeds: [embedOk('Antinuke activé', '> Le serveur est maintenant **protégé**.\n> Toute action suspecte sera automatiquement bloquée.')],
      });
    }

    // ── OFF ───────────────────────────────────────────────────────────────────
    if (sub === 'off' || sub === 'disable') {
      cfg.enabled = false;
      return message.reply({
        embeds: [embedOk('Antinuke désactivé', '> La protection est maintenant **désactivée**.')],
      });
    }

    // ── STATUS ────────────────────────────────────────────────────────────────
    if (!sub || sub === 'status') {
      const wl = cfg.whitelist.length
        ? cfg.whitelist.map(id => `> <@${id}>`).join('\n')
        : '> *Aucun membre.*';

      const threshLines = Object.entries(cfg.thresholds)
        .map(([k, v]) => `> \`${k}\` — **${v.max}** actions / **${v.window / 1000}s**`)
        .join('\n');

      const punishLabel = { ban: '🔨 Ban', kick: '👢 Kick', strip: '🪄 Strip rôles' };

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(cfg.enabled ? 0x2ECC71 : 0xE74C3C)
            .setTitle('🛡️  Antinuke — Statut')
            .addFields(
              { name: '‎', value: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**', inline: false },
              { name: '⚡  État',      value: cfg.enabled ? '> ✅ Activé' : '> ❌ Désactivé', inline: true },
              { name: '⚖️  Sanction',  value: `> ${punishLabel[cfg.punishment]}`,              inline: true },
              { name: '📋  Logs',      value: cfg.logChannel ? `> <#${cfg.logChannel}>` : '> *Non configuré*', inline: true },
              { name: '‎', value: '**──────── Seuils ────────**', inline: false },
              { name: '📊  Limites',   value: threshLines,                                     inline: false },
              { name: '‎', value: '**──────── Whitelist ────────**', inline: false },
              { name: '✅  Membres',   value: wl,                                              inline: false },
              { name: '‎', value: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**', inline: false },
            )
            .setTimestamp()
            .setFooter({ text: 'Système Antinuke' }),
        ],
      });
    }

    // ── WHITELIST ─────────────────────────────────────────────────────────────
    if (sub === 'whitelist' || sub === 'wl') {
      const user = message.mentions.users.first();
      if (!user) return message.reply({ embeds: [embedErr('Mentionne un utilisateur. (`+antinuke whitelist @Membre`)')] });
      if (cfg.whitelist.includes(user.id)) return message.reply({ embeds: [embedErr(`<@${user.id}> est déjà en whitelist.`)] });

      cfg.whitelist.push(user.id);
      return message.reply({
        embeds: [embedOk('Whitelist mise à jour', null, [
          { name: '👤  Membre ajouté', value: `> <@${user.id}>`, inline: true },
          { name: '📋  Total',         value: `> **${cfg.whitelist.length}** membre(s)`, inline: true },
        ])],
      });
    }

    // ── UNWHITELIST ───────────────────────────────────────────────────────────
    if (sub === 'unwhitelist' || sub === 'unwl') {
      const user = message.mentions.users.first();
      if (!user) return message.reply({ embeds: [embedErr('Mentionne un utilisateur. (`+antinuke unwhitelist @Membre`)')] });

      const index = cfg.whitelist.indexOf(user.id);
      if (index === -1) return message.reply({ embeds: [embedErr(`<@${user.id}> n'est pas en whitelist.`)] });

      cfg.whitelist.splice(index, 1);
      return message.reply({
        embeds: [embedOk('Membre retiré de la whitelist', null, [
          { name: '👤  Membre retiré', value: `> <@${user.id}>`, inline: true },
          { name: '📋  Total',         value: `> **${cfg.whitelist.length}** membre(s)`, inline: true },
        ])],
      });
    }

    // ── LOGS ──────────────────────────────────────────────────────────────────
    if (sub === 'logs') {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply({ embeds: [embedErr('Mentionne un salon. (`+antinuke logs #salon`)')] });

      cfg.logChannel = channel.id;
      return message.reply({
        embeds: [embedOk('Salon de logs configuré', null, [
          { name: '📋  Salon', value: `> <#${channel.id}>`, inline: true },
        ])],
      });
    }

    // ── SEUIL ─────────────────────────────────────────────────────────────────
    // Usage : +antinuke seuil channelDelete 2 3000
    if (sub === 'seuil' || sub === 'threshold') {
      const action  = args[1];
      const max     = parseInt(args[2]);
      const window  = parseInt(args[3]);

      const validActions = Object.keys(DEFAULT_CONFIG.thresholds);
      if (!action || !validActions.includes(action)) {
        return message.reply({ embeds: [embedErr(`Action invalide.\nDisponibles : ${validActions.map(a => `\`${a}\``).join(', ')}`)] });
      }
      if (isNaN(max) || max < 1)     return message.reply({ embeds: [embedErr('Le nombre max doit être ≥ 1.')] });
      if (isNaN(window) || window < 1000) return message.reply({ embeds: [embedErr('La fenêtre doit être ≥ 1000ms.')] });

      cfg.thresholds[action] = { max, window };
      return message.reply({
        embeds: [embedOk('Seuil mis à jour', null, [
          { name: '⚡  Action',   value: `> \`${action}\``,      inline: true },
          { name: '🔢  Max',      value: `> **${max}**`,         inline: true },
          { name: '⏱️  Fenêtre',  value: `> **${window}ms**`,   inline: true },
        ])],
      });
    }

    // ── PUNISHMENT ────────────────────────────────────────────────────────────
    if (sub === 'punishment' || sub === 'sanction') {
      const type = args[1]?.toLowerCase();
      if (!['ban', 'kick', 'strip'].includes(type)) {
        return message.reply({ embeds: [embedErr('Type invalide. Disponibles : `ban`, `kick`, `strip`')] });
      }

      cfg.punishment = type;
      const labels = { ban: '🔨 Ban', kick: '👢 Kick', strip: '🪄 Strip rôles' };
      return message.reply({
        embeds: [embedOk('Sanction configurée', null, [
          { name: '⚖️  Nouvelle sanction', value: `> ${labels[type]}`, inline: true },
        ])],
      });
    }

    // ── HELP ──────────────────────────────────────────────────────────────────
    if (sub === 'help') {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📘  Aide — Commande `antinuke`')
            .setDescription('> Protection automatique contre les attaques de serveur.')
            .addFields(
              { name: '‎', value: '**──────── Activation ────────**', inline: false },
              { name: '✅  `+antinuke on`',                              value: '> Active la protection',                    inline: false },
              { name: '❌  `+antinuke off`',                             value: '> Désactive la protection',                 inline: false },
              { name: '📊  `+antinuke status`',                          value: '> Affiche la configuration actuelle',       inline: false },
              { name: '‎', value: '**──────── Configuration ────────**', inline: false },
              { name: '📋  `+antinuke logs #salon`',                     value: '> Définit le salon de logs',                inline: false },
              { name: '⚖️  `+antinuke punishment <ban|kick|strip>`',     value: '> Définit la sanction automatique',         inline: false },
              { name: '📏  `+antinuke seuil <action> <max> <ms>`',       value: '> Modifie un seuil de détection',           inline: false },
              { name: '‎', value: '**──────── Whitelist ────────**', inline: false },
              { name: '➕  `+antinuke whitelist @Membre`',               value: '> Exempte un membre de la détection',       inline: false },
              { name: '➖  `+antinuke unwhitelist @Membre`',             value: '> Retire un membre de la whitelist',        inline: false },
              { name: '‎', value: '**──────── Actions surveillées ────────**', inline: false },
              { name: '🔍  Détections',                                  value: '> `channelDelete` `channelCreate`\n> `roleDelete` `roleCreate`\n> `memberKick` `memberBan`\n> `webhookCreate` `botAdd`', inline: false },
              { name: '‎', value: '**────────────────────────────────**', inline: false },
            )
            .setTimestamp()
            .setFooter({ text: 'Système Antinuke' }),
        ],
      });
    }

    return message.reply({ embeds: [embedErr('Sous-commande inconnue. (`+antinuke help`)')] });
  },
};