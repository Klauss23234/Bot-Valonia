import {
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

// ─── Configuration des rôles staff (par ordre de priorité décroissante) ────────
// Tu peux mettre le nom OU l'ID du rôle Discord dans le champ "id"
let STAFF_CONFIG = [
  { id: '1468744437965521090', emoji: '✨', color: 0xF1C40F, priority: 1 },
  { id: '1468744461990498334', emoji: '🌟', color: 0xE67E22, priority: 2 },
  { id: '1468744537722589420', emoji: '🐬', color: 0x3498DB, priority: 3 },
  { id: '1468744540600139857', emoji: '🐟', color: 0x2ECC71, priority: 4 },
];
// ⚠️ Remplace les ID ci-dessus par les vrais IDs de tes rôles Discord

const DEFAULT_EMOJIS = ['👑', '🛡️', '⚔️', '🔧', '🤝', '💎', '🌟', '✨'];

// ─── Statuts Discord ───────────────────────────────────────────────────────────
const STATUS = {
  online:    { emoji: '🟢', label: 'En ligne'        },
  idle:      { emoji: '🌙', label: 'Absent'          },
  dnd:       { emoji: '🔴', label: 'Ne pas déranger' },
  offline:   { emoji: '⚫', label: 'Hors ligne'      },
  invisible: { emoji: '⚫', label: 'Hors ligne'      },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatus(member) {
  return STATUS[member.presence?.status] ?? STATUS.offline;
}

function embedOk(title, description, fields = []) {
  const e = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(`✅  ${title}`)
    .setTimestamp()
    .setFooter({ text: 'Gestion du staff' });
  if (description) e.setDescription(description);
  if (fields.length) e.addFields(fields);
  return e;
}

function embedErr(description) {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle('❌  Erreur')
    .setDescription(`> ${description}`)
    .setTimestamp()
    .setFooter({ text: 'Gestion du staff' });
}

function embedWarn(description) {
  return new EmbedBuilder()
    .setColor(0xF39C12)
    .setTitle('⚠️  Attention')
    .setDescription(`> ${description}`)
    .setTimestamp()
    .setFooter({ text: 'Gestion du staff' });
}

/** Bouton 🔄 Actualiser */
function buildRefreshRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('staff_refresh')
      .setLabel('Actualiser')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Secondary),
  );
}

function resolveGuildRole(guild, raw) {
  if (!raw) return null;
  const id = raw.replace(/[<@&>]/g, '').trim();
  const byId = guild.roles.cache.get(id);
  if (byId) return byId;
  return guild.roles.cache.find(r => r.name.toLowerCase() === raw.trim().toLowerCase()) ?? null;
}

function findStaffCfg(guildRole) {
  return STAFF_CONFIG.find(cfg => cfg.id === guildRole.id || cfg.id === guildRole.name) ?? null;
}

function getTopStaffConfig(member, guild) {
  return STAFF_CONFIG
    .filter(cfg => {
      const gRole = guild.roles.cache.get(cfg.id) ?? guild.roles.cache.find(r => r.name === cfg.id);
      return gRole && member.roles.cache.has(gRole.id);
    })
    .sort((a, b) => a.priority - b.priority)[0] ?? null;
}

async function resolveMember(message, raw) {
  if (!raw) return null;
  const id = raw.replace(/[<@!>]/g, '');
  return message.guild.members.fetch(id).catch(() => null);
}

// ─── Construit l'embed + le contenu du message staff ──────────────────────────
async function buildStaffPayload(guild) {
  await guild.members.fetch({ withPresences: true }).catch(() => null);

  const staffRoleIds = STAFF_CONFIG
    .map(cfg => (guild.roles.cache.get(cfg.id) ?? guild.roles.cache.find(r => r.name === cfg.id))?.id)
    .filter(Boolean);

  const allStaff = guild.members.cache.filter(m =>
    !m.user.bot && m.roles.cache.some(r => staffRoleIds.includes(r.id))
  );

  if (!allStaff.size) return { embed: null, components: [] };

  const online  = allStaff.filter(m => m.presence?.status === 'online').size;
  const idle    = allStaff.filter(m => m.presence?.status === 'idle').size;
  const dnd     = allStaff.filter(m => m.presence?.status === 'dnd').size;
  const offline = allStaff.size - online - idle - dnd;

  const fields = [];

  for (const cfg of STAFF_CONFIG) {
    const guildRole = guild.roles.cache.get(cfg.id) ?? guild.roles.cache.find(r => r.name === cfg.id);
    if (!guildRole) continue;

    const members = allStaff
      .filter(m => m.roles.cache.has(guildRole.id))
      .sort((a, b) => {
        const order = { online: 0, idle: 1, dnd: 2, offline: 3, invisible: 3 };
        return (order[a.presence?.status] ?? 3) - (order[b.presence?.status] ?? 3)
            || a.displayName.localeCompare(b.displayName);
      });

    if (!members.size) continue;

    fields.push({
      name:   `${cfg.emoji}  ${guildRole.name} — ${members.size} membre(s)`,
      value:  members.map(m => `> ${getStatus(m).emoji}  **${m.displayName}** — \`${m.user.username}\``).join('\n'),
      inline: false,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🛡️  Équipe du serveur — ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
    .setDescription([
      `> Voici l'ensemble du staff de **${guild.name}**.`,
      `> Total : **${allStaff.size}** membre(s) dans l'équipe.`,
      '',
      `> 🟢 En ligne : **${online}**  🌙 Absent : **${idle}**  🔴 NPD : **${dnd}**  ⚫ Hors ligne : **${offline}**`,
    ].join('\n'))
    .addFields(
      { name: '‎', value: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**', inline: false },
      ...fields,
      { name: '‎', value: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**', inline: false },
    )
    .setTimestamp()
    .setFooter({
      text: `${guild.name} — Équipe • +staff help`,
      iconURL: guild.iconURL({ dynamic: true }),
    });

  return { embed, components: [buildRefreshRow()] };
}

// ─── Commande principale ───────────────────────────────────────────────────────
export default {
  name: 'staff',
  aliases: ['equipe', 'team'],
  description: 'Affiche et gère l\'équipe du serveur',
  usage: '+staff [add|remove|promote|demote|role|help]',
  category: 'Informations',

  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'add')                       return handleMemberAdd(message, args.slice(1));
    if (sub === 'remove' || sub === 'kick')  return handleMemberRemove(message, args.slice(1));
    if (sub === 'promote' || sub === 'up')   return handlePromote(message, args.slice(1));
    if (sub === 'demote'  || sub === 'down') return handleDemote(message, args.slice(1));
    if (sub === 'role' || sub === 'roles')   return handleRoleConfig(message, args.slice(1));
    if (sub === 'help')                      return message.reply({ embeds: [buildHelpEmbed()] });

    return showStaff(message);
  },

  // ── Gestion du bouton 🔄 Actualiser ─────────────────────────────────────────
  // À brancher dans ton handler d'interactions (interactionCreate)
  async handleButton(interaction) {
    if (interaction.customId !== 'staff_refresh') return;

    await interaction.deferUpdate();

    const { embed, components } = await buildStaffPayload(interaction.guild);

    if (!embed) {
      return interaction.editReply({
        embeds: [embedErr('Aucun membre staff trouvé.')],
        components: [],
      });
    }

    await interaction.editReply({ embeds: [embed], components });
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  AFFICHAGE DE LA LISTE DU STAFF
// ═══════════════════════════════════════════════════════════════════════════════
async function showStaff(message) {
  const { embed, components } = await buildStaffPayload(message.guild);

  if (!embed) {
    return message.reply({
      embeds: [embedErr('Aucun membre ne possède de rôle staff.\nUtilise `+staff add @Membre <ID | @Rôle | NomDuRôle>` pour en ajouter.')],
    });
  }

  return message.channel.send({ embeds: [embed], components });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GESTION DES MEMBRES STAFF
// ═══════════════════════════════════════════════════════════════════════════════

async function handleMemberAdd(message, args) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    return message.reply({ embeds: [embedErr('Permission requise : **ManageGuild**.')] });
  }

  const target    = await resolveMember(message, args[0]);
  const roleInput = args.slice(1).join(' ').trim();

  if (!target)         return message.reply({ embeds: [embedErr('Usage : `+staff add @Membre <ID | @Rôle | NomDuRôle>`')] });
  if (!roleInput)      return message.reply({ embeds: [embedErr('Précise le rôle staff.\nUsage : `+staff add @Membre <ID | @Rôle | NomDuRôle>`')] });
  if (target.user.bot) return message.reply({ embeds: [embedErr('Impossible d\'ajouter un bot au staff.')] });

  const guildRole = resolveGuildRole(message.guild, roleInput);
  if (!guildRole) return message.reply({ embeds: [embedErr(`Rôle introuvable : \`${roleInput}\`\nDonne un nom, un ID ou une mention de rôle.`)] });

  const cfg = findStaffCfg(guildRole);
  if (!cfg) {
    const list = STAFF_CONFIG.map(c => {
      const r = message.guild.roles.cache.get(c.id);
      return r ? `\`${r.name}\`` : `\`ID:${c.id}\``;
    }).join(', ');
    return message.reply({ embeds: [embedErr(`**${guildRole.name}** n'est pas un rôle staff configuré.\nRôles staff : ${list}`)] });
  }

  if (target.roles.cache.has(guildRole.id)) {
    return message.reply({ embeds: [embedWarn(`<@${target.id}> possède déjà le rôle **${guildRole.name}**.`)] });
  }

  await target.roles.add(guildRole, `Ajouté au staff par ${message.author.tag}`);

  return message.reply({
    embeds: [embedOk('Membre ajouté au staff', null, [
      { name: '👤  Membre',         value: `> <@${target.id}>`,         inline: true },
      { name: `${cfg.emoji}  Rôle`, value: `> <@&${guildRole.id}>`,     inline: true },
      { name: '🛡️  Exécuté par',    value: `> <@${message.author.id}>`, inline: true },
    ])],
  });
}

async function handleMemberRemove(message, args) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    return message.reply({ embeds: [embedErr('Permission requise : **ManageGuild**.')] });
  }

  const target = await resolveMember(message, args[0]);
  if (!target) return message.reply({ embeds: [embedErr('Usage : `+staff remove @Membre`')] });

  const staffRoles = STAFF_CONFIG
    .map(cfg => message.guild.roles.cache.get(cfg.id) ?? message.guild.roles.cache.find(r => r.name === cfg.id))
    .filter(r => r && target.roles.cache.has(r.id));

  if (!staffRoles.length) {
    return message.reply({ embeds: [embedWarn(`<@${target.id}> n'est pas dans le staff.`)] });
  }

  for (const role of staffRoles) {
    await target.roles.remove(role, `Retiré du staff par ${message.author.tag}`);
  }

  return message.reply({
    embeds: [embedOk('Membre retiré du staff', null, [
      { name: '👤  Membre',         value: `> <@${target.id}>`,                                inline: true },
      { name: '🏷️  Rôles retirés',  value: `> ${staffRoles.map(r => `\`${r.name}\``).join(', ')}`, inline: true },
      { name: '🛡️  Exécuté par',    value: `> <@${message.author.id}>`,                        inline: true },
    ])],
  });
}

async function handlePromote(message, args) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    return message.reply({ embeds: [embedErr('Permission requise : **ManageGuild**.')] });
  }

  const target = await resolveMember(message, args[0]);
  if (!target)         return message.reply({ embeds: [embedErr('Usage : `+staff promote @Membre`')] });
  if (target.user.bot) return message.reply({ embeds: [embedErr('Impossible de promouvoir un bot.')] });

  const sorted     = [...STAFF_CONFIG].sort((a, b) => a.priority - b.priority);
  const currentCfg = getTopStaffConfig(target, message.guild);

  if (!currentCfg) {
    const lowestCfg = sorted[sorted.length - 1];
    const guildRole = message.guild.roles.cache.get(lowestCfg.id) ?? message.guild.roles.cache.find(r => r.name === lowestCfg.id);
    if (!guildRole) return message.reply({ embeds: [embedErr(`Le rôle avec l'ID \`${lowestCfg.id}\` est introuvable sur le serveur.`)] });

    await target.roles.add(guildRole, `Promu au staff par ${message.author.tag}`);

    return message.reply({
      embeds: [embedOk('Membre promu dans le staff', null, [
        { name: '👤  Membre',                       value: `> <@${target.id}>`,         inline: true },
        { name: `${lowestCfg.emoji}  Nouveau rôle`, value: `> <@&${guildRole.id}>`,     inline: true },
        { name: '🛡️  Exécuté par',                  value: `> <@${message.author.id}>`, inline: true },
      ])],
    });
  }

  if (currentCfg.priority === 1) {
    const currentRole = message.guild.roles.cache.get(currentCfg.id);
    return message.reply({ embeds: [embedWarn(`<@${target.id}> est déjà au grade le plus élevé (**${currentRole?.name ?? currentCfg.id}**).`)] });
  }

  const nextCfg = sorted.find(c => c.priority === currentCfg.priority - 1);
  const oldRole = message.guild.roles.cache.get(currentCfg.id) ?? message.guild.roles.cache.find(r => r.name === currentCfg.id);
  const newRole = message.guild.roles.cache.get(nextCfg.id)    ?? message.guild.roles.cache.find(r => r.name === nextCfg.id);

  if (!oldRole || !newRole) return message.reply({ embeds: [embedErr('Un des rôles Discord est introuvable sur le serveur.')] });

  await target.roles.remove(oldRole, `Promotion par ${message.author.tag}`);
  await target.roles.add(newRole,    `Promotion par ${message.author.tag}`);

  return message.reply({
    embeds: [embedOk('Membre promu', null, [
      { name: '👤  Membre',                    value: `> <@${target.id}>`,         inline: true },
      { name: '⬇️  Ancien grade',              value: `> <@&${oldRole.id}>`,        inline: true },
      { name: `${nextCfg.emoji}  Nouveau grade`, value: `> <@&${newRole.id}>`,      inline: true },
      { name: '🛡️  Exécuté par',               value: `> <@${message.author.id}>`, inline: false },
    ])],
  });
}

async function handleDemote(message, args) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    return message.reply({ embeds: [embedErr('Permission requise : **ManageGuild**.')] });
  }

  const target = await resolveMember(message, args[0]);
  if (!target) return message.reply({ embeds: [embedErr('Usage : `+staff demote @Membre`')] });

  const sorted     = [...STAFF_CONFIG].sort((a, b) => a.priority - b.priority);
  const currentCfg = getTopStaffConfig(target, message.guild);

  if (!currentCfg) {
    return message.reply({ embeds: [embedWarn(`<@${target.id}> n'est pas dans le staff.`)] });
  }

  if (currentCfg.priority === sorted[sorted.length - 1].priority) {
    const guildRole = message.guild.roles.cache.get(currentCfg.id) ?? message.guild.roles.cache.find(r => r.name === currentCfg.id);
    if (guildRole) await target.roles.remove(guildRole, `Rétrogradé hors staff par ${message.author.tag}`);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('🔻  Membre retiré du staff')
          .setDescription(`> <@${target.id}> était au grade le plus bas et a été **retiré du staff**.`)
          .addFields(
            { name: '👤  Membre',       value: `> <@${target.id}>`,                          inline: true },
            { name: '🏷️  Grade retiré', value: `> <@&${guildRole?.id ?? currentCfg.id}>`,    inline: true },
            { name: '🛡️  Exécuté par',  value: `> <@${message.author.id}>`,                  inline: true },
          )
          .setTimestamp()
          .setFooter({ text: 'Gestion du staff' }),
      ],
    });
  }

  const nextCfg = sorted.find(c => c.priority === currentCfg.priority + 1);
  const oldRole = message.guild.roles.cache.get(currentCfg.id) ?? message.guild.roles.cache.find(r => r.name === currentCfg.id);
  const newRole = message.guild.roles.cache.get(nextCfg.id)    ?? message.guild.roles.cache.find(r => r.name === nextCfg.id);

  if (!oldRole || !newRole) return message.reply({ embeds: [embedErr('Un des rôles Discord est introuvable sur le serveur.')] });

  await target.roles.remove(oldRole, `Rétrogradation par ${message.author.tag}`);
  await target.roles.add(newRole,    `Rétrogradation par ${message.author.tag}`);

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle('🔻  Membre rétrogradé')
        .addFields(
          { name: '👤  Membre',                    value: `> <@${target.id}>`,         inline: true },
          { name: '⬆️  Ancien grade',              value: `> <@&${oldRole.id}>`,        inline: true },
          { name: `${nextCfg.emoji}  Nouveau grade`, value: `> <@&${newRole.id}>`,      inline: true },
          { name: '🛡️  Exécuté par',               value: `> <@${message.author.id}>`, inline: false },
        )
        .setTimestamp()
        .setFooter({ text: 'Gestion du staff' }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GESTION DE LA CONFIG DES RÔLES STAFF
// ═══════════════════════════════════════════════════════════════════════════════
async function handleRoleConfig(message, args) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    return message.reply({ embeds: [embedErr('Permission requise : **ManageGuild**.')] });
  }

  const action = args[0]?.toLowerCase();

  if (!action || action === 'list') {
    const lines = STAFF_CONFIG.length
      ? [...STAFF_CONFIG]
          .sort((a, b) => a.priority - b.priority)
          .map(c => {
            const r = message.guild.roles.cache.get(c.id) ?? message.guild.roles.cache.find(r => r.name === c.id);
            const label = r ? `<@&${r.id}> — \`${r.id}\`` : `\`ID: ${c.id}\` *(rôle introuvable)*`;
            return `> ${c.emoji}  ${label} — priorité \`#${c.priority}\``;
          })
          .join('\n')
      : '> *Aucun rôle staff configuré.*';

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📋  Rôles staff configurés')
          .setDescription(lines)
          .addFields({ name: '‎', value: `> **${STAFF_CONFIG.length}** rôle(s) enregistré(s).`, inline: false })
          .setTimestamp()
          .setFooter({ text: 'Gestion du staff' }),
      ],
    });
  }

  if (action === 'add') {
    const rawArgs = args.slice(1);
    if (!rawArgs.length) return message.reply({ embeds: [embedErr('Usage : `+staff role add <ID | @Rôle | NomDuRôle> [emoji]`')] });

    const lastArg    = rawArgs[rawArgs.length - 1];
    const emojiRegex = /^\p{Emoji}/u;
    let roleInput, emoji;

    if (emojiRegex.test(lastArg) && rawArgs.length > 1) {
      emoji     = lastArg;
      roleInput = rawArgs.slice(0, -1).join(' ').trim();
    } else {
      roleInput = rawArgs.join(' ').trim();
      emoji     = DEFAULT_EMOJIS[STAFF_CONFIG.length % DEFAULT_EMOJIS.length];
    }

    const guildRole = resolveGuildRole(message.guild, roleInput);
    if (!guildRole) return message.reply({ embeds: [embedErr(`Rôle introuvable : \`${roleInput}\``)] });
    if (STAFF_CONFIG.some(c => c.id === guildRole.id)) return message.reply({ embeds: [embedErr(`<@&${guildRole.id}> est déjà dans la config staff.`)] });

    const newPriority = STAFF_CONFIG.length + 1;
    STAFF_CONFIG.push({ id: guildRole.id, emoji, color: guildRole.color || 0x5865F2, priority: newPriority });

    return message.reply({
      embeds: [embedOk('Rôle staff ajouté à la config', null, [
        { name: '🏷️  Rôle',    value: `> <@&${guildRole.id}>`, inline: true },
        { name: '🆔  ID',       value: `> \`${guildRole.id}\``, inline: true },
        { name: '🎭  Emoji',    value: `> ${emoji}`,            inline: true },
        { name: '📊  Priorité', value: `> \`#${newPriority}\``, inline: true },
      ])],
    });
  }

  if (action === 'remove' || action === 'delete') {
    const roleInput = args.slice(1).join(' ').trim();
    if (!roleInput) return message.reply({ embeds: [embedErr('Usage : `+staff role remove <ID | @Rôle | NomDuRôle>`')] });

    const guildRole = resolveGuildRole(message.guild, roleInput);
    const index = guildRole
      ? STAFF_CONFIG.findIndex(c => c.id === guildRole.id)
      : STAFF_CONFIG.findIndex(c => c.id === roleInput.trim());

    if (index === -1) return message.reply({ embeds: [embedErr(`\`${roleInput}\` n'est pas dans la config staff.`)] });

    const removed     = STAFF_CONFIG.splice(index, 1)[0];
    const removedRole = message.guild.roles.cache.get(removed.id);
    STAFF_CONFIG.forEach((c, i) => { c.priority = i + 1; });

    return message.reply({
      embeds: [embedOk('Rôle retiré de la config', null, [
        { name: '🏷️  Retiré',         value: removedRole ? `> <@&${removedRole.id}>` : `> \`ID: ${removed.id}\``, inline: true },
        { name: '📋  Rôles restants',  value: `> **${STAFF_CONFIG.length}**`,                                       inline: true },
      ])],
    });
  }

  if (action === 'emoji') {
    const newEmoji  = args[args.length - 1];
    const roleInput = args.slice(1, -1).join(' ').trim();
    if (!roleInput || !newEmoji) return message.reply({ embeds: [embedErr('Usage : `+staff role emoji <ID | @Rôle | NomDuRôle> <emoji>`')] });

    const guildRole = resolveGuildRole(message.guild, roleInput);
    const cfg = guildRole
      ? STAFF_CONFIG.find(c => c.id === guildRole.id)
      : STAFF_CONFIG.find(c => c.id === roleInput.trim());

    if (!cfg) return message.reply({ embeds: [embedErr(`\`${roleInput}\` n'est pas dans la config staff.`)] });

    const oldEmoji = cfg.emoji;
    cfg.emoji      = newEmoji;
    const role     = message.guild.roles.cache.get(cfg.id);

    return message.reply({
      embeds: [embedOk('Emoji modifié', null, [
        { name: '🏷️  Rôle',      value: role ? `> <@&${role.id}>` : `> \`ID: ${cfg.id}\``, inline: true },
        { name: '🔄  Avant',      value: `> ${oldEmoji}`,                                    inline: true },
        { name: '✅  Maintenant', value: `> ${newEmoji}`,                                    inline: true },
      ])],
    });
  }

  return message.reply({ embeds: [embedErr(`Action inconnue : \`${action}\`\nDisponibles : \`add\`, \`remove\`, \`list\`, \`emoji\``)] });
}

// ─── Embed d'aide ──────────────────────────────────────────────────────────────
function buildHelpEmbed() {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('📘  Aide — Commande `staff`')
    .setDescription('> Gestion complète de l\'équipe.\n> Les rôles s\'acceptent en **ID**, **mention** ou **nom**.')
    .addFields(
      { name: '‎', value: '**──────── Affichage ────────**', inline: false },
      { name: '👁️  `+staff`',                                       value: '> Affiche la liste du staff avec bouton 🔄',  inline: false },
      { name: '‎', value: '**──────── Gestion des membres ────────**', inline: false },
      { name: '➕  `+staff add @Membre <ID|@Rôle|Nom>`',             value: '> Donne un rôle staff à un membre',           inline: false },
      { name: '➖  `+staff remove @Membre`',                         value: '> Retire tous les rôles staff d\'un membre',  inline: false },
      { name: '⬆️  `+staff promote @Membre`',                       value: '> Monte le membre d\'un grade',               inline: false },
      { name: '⬇️  `+staff demote @Membre`',                        value: '> Descend le membre d\'un grade',             inline: false },
      { name: '‎', value: '**──────── Config des rôles ────────**', inline: false },
      { name: '📋  `+staff role list`',                              value: '> Liste les rôles staff configurés',          inline: false },
      { name: '➕  `+staff role add <ID|@Rôle|Nom> [emoji]`',        value: '> Ajoute un rôle à la config staff',          inline: false },
      { name: '➖  `+staff role remove <ID|@Rôle|Nom>`',             value: '> Retire un rôle de la config staff',         inline: false },
      { name: '🎭  `+staff role emoji <ID|@Rôle|Nom> <emoji>`',      value: '> Change l\'emoji d\'un rôle staff',          inline: false },
      { name: '‎', value: '**────────────────────────────────────**', inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'Gestion du staff' });
}