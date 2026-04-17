import { PermissionsBitField, EmbedBuilder } from 'discord.js';

// ╔══════════════════════════════════════════════════════════════════╗
//  🎨  PALETTE — Couleurs des embeds
// ╚══════════════════════════════════════════════════════════════════╝
const C = {
  success : 0x2ECC71,
  error   : 0xE74C3C,
  warning : 0xF39C12,
  info    : 0x3498DB,
  primary : 0x5865F2,
};

// ╔══════════════════════════════════════════════════════════════════╗
//  🔧  HELPERS — Constructeurs d'embeds
// ╚══════════════════════════════════════════════════════════════════╝

const footer = { text: '🏷️ Système de rôles' };

/** Embed ✅ succès */
function ok(title, fields = [], desc = null) {
  const e = new EmbedBuilder()
    .setColor(C.success)
    .setTitle(`✅  ${title}`)
    .setFooter(footer)
    .setTimestamp();
  if (desc)          e.setDescription(desc);
  if (fields.length) e.addFields(fields);
  return e;
}

/** Embed ❌ erreur */
function err(desc) {
  return new EmbedBuilder()
    .setColor(C.error)
    .setTitle('❌  Erreur')
    .setDescription(`> ${desc}`)
    .setFooter(footer)
    .setTimestamp();
}

/** Embed ⚠️ avertissement */
function warn(desc) {
  return new EmbedBuilder()
    .setColor(C.warning)
    .setTitle('⚠️  Avertissement')
    .setDescription(`> ${desc}`)
    .setFooter(footer)
    .setTimestamp();
}

// ╔══════════════════════════════════════════════════════════════════╗
//  🛡️  GUARD — Vérification rapide des permissions
// ╚══════════════════════════════════════════════════════════════════╝
const perm  = (member, flag) => member.permissions.has(PermissionsBitField.Flags[flag]);
const send  = (msg, embed)   => msg.reply({ embeds: [embed] });

// ╔══════════════════════════════════════════════════════════════════╗
//  🏷️  COMMANDE PRINCIPALE
// ╚══════════════════════════════════════════════════════════════════╝
export default {
  name        : 'role',
  aliases     : ['roles', 'r'],
  description : 'Gestion complète des rôles du serveur',
  usage       : '+role <sous-commande> [options]',
  category    : 'Staff',
  permissions : ['ManageRoles'],

  async execute(message, args) {

    const sub = args.shift()?.toLowerCase();

    if (!sub) return send(message, new EmbedBuilder()
      .setColor(C.primary)
      .setTitle('📘  Commande `role`')
      .setDescription('> Utilise `+role help` pour afficher toutes les sous-commandes disponibles.')
      .setFooter(footer)
      .setTimestamp(),
    );

    switch (sub) {

      // ══════════════════════════════════════════════════
      //  ADD  —  Ajouter un rôle à un membre
      // ══════════════════════════════════════════════════
      case 'add': {
        if (!perm(message.member, 'Administrator'))
          return send(message, err("Permission requise : **Administrator**."));

        const role = message.mentions.roles.first();
        const user = message.mentions.users.first();

        if (!role) return send(message, err('Mentionne un **rôle** valide.\n> `+role add @Rôle @Membre`'));
        if (!user) return send(message, err('Mentionne un **membre** valide.\n> `+role add @Rôle @Membre`'));

        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return send(message, err('Membre introuvable sur le serveur.'));

        if (member.roles.cache.has(role.id))
          return send(message, warn(`<@${user.id}> possède déjà le rôle ${role}.`));

        await member.roles.add(role, `Ajouté par ${message.author.tag}`);

        return send(message, ok('Rôle ajouté', [
          { name: '👤  Membre',      value: `> <@${user.id}>`,              inline: true },
          { name: '🏷️  Rôle',        value: `> ${role}`,                    inline: true },
          { name: '🛡️  Exécuté par', value: `> <@${message.author.id}>`,   inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  REMOVE  —  Retirer un rôle à un membre
      // ══════════════════════════════════════════════════
      case 'remove': {
        if (!perm(message.member, 'Administrator'))
          return send(message, err("Permission requise : **Administrator**."));

        const role = message.mentions.roles.first();
        const user = message.mentions.users.first();

        if (!role) return send(message, err('Mentionne un **rôle** valide.\n> `+role remove @Rôle @Membre`'));
        if (!user) return send(message, err('Mentionne un **membre** valide.\n> `+role remove @Rôle @Membre`'));

        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return send(message, err('Membre introuvable sur le serveur.'));

        if (!member.roles.cache.has(role.id))
          return send(message, warn(`<@${user.id}> ne possède pas le rôle ${role}.`));

        await member.roles.remove(role, `Retiré par ${message.author.tag}`);

        return send(message, ok('Rôle retiré', [
          { name: '👤  Membre',      value: `> <@${user.id}>`,              inline: true },
          { name: '🏷️  Rôle',        value: `> ${role}`,                    inline: true },
          { name: '🛡️  Exécuté par', value: `> <@${message.author.id}>`,   inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  TOGGLE  —  Bascule le rôle selon l'état actuel
      // ══════════════════════════════════════════════════
      case 'toggle': {
        if (!perm(message.member, 'ManageRoles'))
          return send(message, err("Permission requise : **ManageRoles**."));

        const member = message.mentions.members.first();
        const role   = message.mentions.roles.first();

        if (!member || !role)
          return send(message, err('Usage : `+role toggle @Membre @Rôle`'));

        const had = member.roles.cache.has(role.id);
        had
          ? await member.roles.remove(role, `Toggle par ${message.author.tag}`)
          : await member.roles.add(role,    `Toggle par ${message.author.tag}`);

        return send(message, new EmbedBuilder()
          .setColor(had ? C.warning : C.success)
          .setTitle(had ? '➖  Rôle retiré' : '➕  Rôle ajouté')
          .addFields(
            { name: '👤  Membre', value: `> ${member}`,                 inline: true },
            { name: '🏷️  Rôle',   value: `> ${role}`,                   inline: true },
            { name: '🔄  Action', value: had ? '> Retiré' : '> Ajouté', inline: true },
          )
          .setFooter(footer)
          .setTimestamp(),
        );
      }

      // ══════════════════════════════════════════════════
      //  INFO  —  Informations complètes sur un rôle
      // ══════════════════════════════════════════════════
      case 'info': {
        const role = message.mentions.roles.first();
        if (!role) return send(message, err('Usage : `+role info @Rôle`'));

        const created    = Math.floor(role.createdTimestamp / 1000);
        const colorHex   = role.hexColor !== '#000000' ? role.hexColor : '#99AAB5';
        const permsCount = role.permissions.toArray().length;
        const topPerms   = role.permissions.toArray().slice(0, 5).map(p => `\`${p}\``).join(', ') || '`Aucune`';

        return send(message, new EmbedBuilder()
          .setColor(role.color || C.primary)
          .setTitle(`🏷️  ${role.name}`)
          .setDescription(`> Informations complètes sur le rôle ${role}.`)
          .addFields(
            { name: '‎', value: '**──────────── Identité ────────────**', inline: false },
            { name: '🆔  ID',                 value: `> \`${role.id}\``,                          inline: true  },
            { name: '🎨  Couleur',             value: `> \`${colorHex}\``,                        inline: true  },
            { name: '📅  Créé le',             value: `> <t:${created}:D>`,                       inline: true  },
            { name: '‎', value: '**──────────── Propriétés ────────────**', inline: false },
            { name: '👥  Membres',              value: `> **${role.members.size}**`,               inline: true  },
            { name: '📊  Position',             value: `> **#${role.position}**`,                  inline: true  },
            { name: '🔒  Permissions',          value: `> **${permsCount}** permission(s)`,        inline: true  },
            { name: '📢  Mentionnable',         value: role.mentionable ? '> ✅ Oui' : '> ❌ Non', inline: true  },
            { name: '📌  Affiché séparément',   value: role.hoist       ? '> ✅ Oui' : '> ❌ Non', inline: true  },
            { name: '🤖  Rôle bot',             value: role.managed     ? '> ✅ Oui' : '> ❌ Non', inline: true  },
            { name: '‎', value: '**──────── Permissions notables ────────**', inline: false },
            { name: '⚙️  Top 5',               value: `> ${topPerms}`,                            inline: false },
            { name: '‎', value: '**────────────────────────────────────**', inline: false },
          )
          .setFooter(footer)
          .setTimestamp(),
        );
      }

      // ══════════════════════════════════════════════════
      //  LIST  —  Lister tous les rôles
      // ══════════════════════════════════════════════════
      case 'list': {
        const roles = message.guild.roles.cache
          .filter(r => r.name !== '@everyone')
          .sort((a, b) => b.position - a.position);

        const lines = roles.map(r =>
          `> ${r} — \`${r.members.size} membre(s)\`` +
          (r.hoist   ? ' · 📌' : '') +
          (r.managed ? ' · 🤖' : '')
        );

        const pages  = [];
        let   buffer = '';
        for (const line of lines) {
          if ((buffer + line + '\n').length > 1000) { pages.push(buffer.trim()); buffer = ''; }
          buffer += line + '\n';
        }
        if (buffer.trim()) pages.push(buffer.trim());

        const embeds = pages.map((page, i) =>
          new EmbedBuilder()
            .setColor(C.info)
            .setTitle(i === 0 ? `📋  Rôles du serveur — ${roles.size} rôle(s)` : null)
            .setDescription(page)
            .setFooter({ text: `Page ${i + 1}/${pages.length} — 🏷️ Système de rôles` })
            .setTimestamp()
        );

        return message.reply({ embeds: embeds.slice(0, 10) });
      }

      // ══════════════════════════════════════════════════
      //  MEMBERS  —  Membres d'un rôle
      // ══════════════════════════════════════════════════
      case 'members': {
        const role = message.mentions.roles.first();
        if (!role) return send(message, err('Usage : `+role members @Rôle`'));

        const list   = role.members.map(m => `> <@${m.id}>`);
        const capped = list.length > 30;
        const body   = list.length
          ? list.slice(0, 30).join('\n') + (capped ? `\n> *… et **${list.length - 30}** membre(s) de plus.*` : '')
          : '> *Aucun membre ne possède ce rôle.*';

        return send(message, new EmbedBuilder()
          .setColor(role.color || C.primary)
          .setTitle(`👥  Membres — ${role.name}`)
          .setDescription(body)
          .setFooter({ text: `${role.members.size} membre(s) au total — 🏷️ Système de rôles` })
          .setTimestamp(),
        );
      }

      // ══════════════════════════════════════════════════
      //  CREATE  —  Créer un rôle
      // ══════════════════════════════════════════════════
      case 'create': {
        if (!perm(message.member, 'ManageRoles'))
          return send(message, err("Permission requise : **ManageRoles**."));

        const name = args.join(' ').trim();
        if (!name) return send(message, err('Usage : `+role create <nom du rôle>`'));

        const role = await message.guild.roles.create({
          name,
          reason: `Créé par ${message.author.tag}`,
        });

        return send(message, ok('Rôle créé', [
          { name: '🏷️  Rôle',       value: `> ${role}`,                  inline: true },
          { name: '🆔  ID',         value: `> \`${role.id}\``,            inline: true },
          { name: '🛡️  Créé par',   value: `> <@${message.author.id}>`,  inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  DELETE  —  Supprimer un rôle
      // ══════════════════════════════════════════════════
      case 'delete': {
        if (!perm(message.member, 'ManageRoles'))
          return send(message, err("Permission requise : **ManageRoles**."));

        const role = message.mentions.roles.first();
        if (!role) return send(message, err('Usage : `+role delete @Rôle`'));

        if (role.position >= message.guild.members.me.roles.highest.position)
          return send(message, err("Impossible : ce rôle est **supérieur ou égal** au rôle du bot."));

        const { name, id } = role;
        await role.delete(`Supprimé par ${message.author.tag}`);

        return send(message, ok('Rôle supprimé', [
          { name: '🏷️  Nom',          value: `> \`${name}\``,              inline: true },
          { name: '🆔  ID',           value: `> \`${id}\``,                inline: true },
          { name: '🛡️  Supprimé par', value: `> <@${message.author.id}>`,  inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  COLOR  —  Changer la couleur d'un rôle
      // ══════════════════════════════════════════════════
      case 'color': {
        if (!perm(message.member, 'ManageRoles'))
          return send(message, err("Permission requise : **ManageRoles**."));

        const role = message.mentions.roles.first();
        const raw  = args.find(a => /^#?[0-9A-Fa-f]{6}$/.test(a));

        if (!role) return send(message, err('Usage : `+role color @Rôle #HEX`'));
        if (!raw)  return send(message, err('Fournis une couleur **hexadécimale** valide.\n> Exemple : `#3498DB`'));

        const hex = raw.startsWith('#') ? raw : `#${raw}`;
        await role.setColor(hex, `Modifié par ${message.author.tag}`);

        return send(message, ok('Couleur modifiée', [
          { name: '🏷️  Rôle',    value: `> ${role}`,                  inline: true },
          { name: '🎨  Couleur', value: `> \`${hex}\``,                inline: true },
          { name: '🛡️  Par',     value: `> <@${message.author.id}>`,  inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  RENAME  —  Renommer un rôle
      // ══════════════════════════════════════════════════
      case 'rename': {
        if (!perm(message.member, 'ManageRoles'))
          return send(message, err("Permission requise : **ManageRoles**."));

        const role    = message.mentions.roles.first();
        const newName = args.filter(a => !a.startsWith('<@')).join(' ').trim();

        if (!role)    return send(message, err('Usage : `+role rename @Rôle <nouveau nom>`'));
        if (!newName) return send(message, err('Fournis un **nouveau nom** pour le rôle.'));

        const oldName = role.name;
        await role.setName(newName, `Renommé par ${message.author.tag}`);

        return send(message, ok('Rôle renommé', [
          { name: '📝  Ancien nom',  value: `> \`${oldName}\``,  inline: true },
          { name: '✏️  Nouveau nom', value: `> \`${newName}\``,  inline: true },
          { name: '🛡️  Par',        value: `> <@${message.author.id}>`, inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  HOIST  —  Basculer l'affichage séparé
      // ══════════════════════════════════════════════════
      case 'hoist': {
        if (!perm(message.member, 'ManageRoles'))
          return send(message, err("Permission requise : **ManageRoles**."));

        const role = message.mentions.roles.first();
        if (!role) return send(message, err('Usage : `+role hoist @Rôle`'));

        const next = !role.hoist;
        await role.setHoist(next, `Hoist modifié par ${message.author.tag}`);

        return send(message, ok(`Hoist ${next ? 'activé' : 'désactivé'}`, [
          { name: '🏷️  Rôle', value: `> ${role}`,                                   inline: true },
          { name: '📌  État', value: next ? '> ✅ Affiché séparément' : '> ❌ Masqué', inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  MENTION  —  Basculer la mentionnabilité
      // ══════════════════════════════════════════════════
      case 'mention': {
        if (!perm(message.member, 'ManageRoles'))
          return send(message, err("Permission requise : **ManageRoles**."));

        const role = message.mentions.roles.first();
        if (!role) return send(message, err('Usage : `+role mention @Rôle`'));

        const next = !role.mentionable;
        await role.setMentionable(next, `Mentionnable modifié par ${message.author.tag}`);

        return send(message, ok(`Mentionnable ${next ? 'activé' : 'désactivé'}`, [
          { name: '🏷️  Rôle', value: `> ${role}`,                                     inline: true },
          { name: '📢  État', value: next ? '> ✅ Mentionnable' : '> ❌ Non mentionnable', inline: true },
        ]));
      }

      // ══════════════════════════════════════════════════
      //  HELP  —  Aide complète
      // ══════════════════════════════════════════════════
      case 'help': {
        return send(message, new EmbedBuilder()
          .setColor(C.primary)
          .setTitle('📘  Aide — Système de rôles')
          .setDescription('> Gestion complète des rôles du serveur.\n> Préfixe : `+role <sous-commande>`')
          .addFields(
            { name: '‎', value: '**──────────── 🎯 Attribution ────────────**', inline: false },
            { name: '➕  `add @Rôle @Membre`',    value: '> Ajoute un rôle à un membre *(Admin)*',      inline: false },
            { name: '➖  `remove @Rôle @Membre`', value: '> Retire un rôle d\'un membre *(Admin)*',     inline: false },
            { name: '🔄  `toggle @Membre @Rôle`', value: '> Bascule le rôle selon l\'état actuel',     inline: false },
            { name: '‎', value: '**──────────── 🔍 Informations ────────────**', inline: false },
            { name: 'ℹ️  `info @Rôle`',           value: '> Détails complets sur un rôle',              inline: false },
            { name: '📋  `list`',                  value: '> Liste tous les rôles du serveur',           inline: false },
            { name: '👥  `members @Rôle`',         value: '> Membres possédant ce rôle',                inline: false },
            { name: '‎', value: '**──────────── 🛠️ Gestion ────────────**', inline: false },
            { name: '🧱  `create <nom>`',          value: '> Crée un nouveau rôle',                     inline: false },
            { name: '🗑️  `delete @Rôle`',          value: '> Supprime un rôle existant',                inline: false },
            { name: '🎨  `color @Rôle #HEX`',      value: '> Change la couleur du rôle',               inline: false },
            { name: '✏️  `rename @Rôle <nom>`',    value: '> Renomme un rôle',                          inline: false },
            { name: '‎', value: '**──────────── ⚙️ Options ────────────**', inline: false },
            { name: '📌  `hoist @Rôle`',           value: '> Active/désactive l\'affichage séparé',     inline: false },
            { name: '📢  `mention @Rôle`',         value: '> Active/désactive la mention du rôle',      inline: false },
            { name: '‎', value: '**────────────────────────────────────────**\n> 🔐 Certaines commandes requièrent **Administrator** ou **ManageRoles**.', inline: false },
          )
          .setFooter(footer)
          .setTimestamp(),
        );
      }

      // ══════════════════════════════════════════════════
      //  DEFAULT  —  Sous-commande inconnue
      // ══════════════════════════════════════════════════
      default:
        return send(message, err(
          `Sous-commande inconnue : \`${sub}\`\n> Tape \`+role help\` pour voir la liste complète.`
        ));
    }
  },
};