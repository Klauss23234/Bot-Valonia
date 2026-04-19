import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

// ════════════════════════════════════════════════════════════════
// ⚙️ CONFIG — Change l'ID par celui de ton salon patch notes
// ════════════════════════════════════════════════════════════════
const SALON_ID = "TON_ID_DE_SALON_ICI";

// ════════════════════════════════════════════════════════════════
// 📋 PATCH NOTES — Ajoute tes patch notes ici manuellement
//    ou utilise +patchnote add pour le faire en interactif
// ════════════════════════════════════════════════════════════════
const PATCHNOTES = [
  {
    numero: "2",
    date: "25/12/2025",
    titre: "Mise à jour de Noël 🎄",
    description: "Ho ho ho ! Le staff vous souhaite un joyeux Noël 🎅 Voici toutes les nouveautés spéciales des fêtes !",
    ajouts: [
      "🎄 Salon #noël temporaire pour partager vos photos de fêtes",
      "🎁 Giveaway de Nitro dans #giveaway jusqu'au 31 décembre",
      "🎶 Playlist de Noël activée dans les salons vocaux",
      "🤶 Rôle temporaire **Lutin de Noël** pour les membres actifs",
      "❄️ Décoration de Noël sur tous les salons et catégories",
    ],
    modifications: [
      "🔧 #général renommé en #général-des-fêtes jusqu'au 1er janvier",
      "🎨 Couleurs du serveur passées aux tons de Noël",
      "📢 Messages de voeux ajoutés dans les annonces du staff",
    ],
    corrections: [
      "🐛 Fix de l'accès au salon #événements pour certains membres",
      "🐛 Correction des permissions vocales du rôle Boosteur",
    ],
    notes: "Joyeux Noël à tous de la part de toute l'équipe ! 🎅🎁\nProfitez bien des fêtes, on se retrouve en 2026 avec encore plus de nouveautés. ❤️",
  },
  {
    numero: "1",
    date: "01/01/2026",
    titre: "Lancement du serveur 🚀",
    description: "Bienvenue sur le serveur ! Voici la toute première patch note.",
    ajouts: [
      "✨ Ouverture de tous les salons de discussion",
      "✨ Mise en place du système de rôles",
      "✨ Arrivée du bot Amity",
    ],
    modifications: [],
    corrections: [
      "🐛 Aucun bug pour l'instant !",
    ],
    notes: "Merci à tous d'être là dès le début ! 🎉",
  },
];

// ════════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ════════════════════════════════════════════════════════════════
const sessions = new Map();

function dateNow() {
  return new Date().toLocaleDateString('fr-FR');
}

function toField(arr) {
  return arr.length ? arr.join("\n") : "*Aucun*";
}

function buildEmbed(pn) {
  const embed = new EmbedBuilder()
    .setTitle(`📰 Patch Note #${pn.numero} — ${pn.titre}`)
    .setColor("#a29bfe")
    .setDescription(pn.description)
    .setTimestamp(new Date(`${pn.date.split("/").reverse().join("-")}`));

  if (pn.ajouts?.length)
    embed.addFields({ name: "✨ Ajouts", value: toField(pn.ajouts) });

  if (pn.modifications?.length)
    embed.addFields({ name: "🔧 Modifications", value: toField(pn.modifications) });

  if (pn.corrections?.length)
    embed.addFields({ name: "🐛 Corrections", value: toField(pn.corrections) });

  if (pn.notes)
    embed.addFields({ name: "📌 Note du staff", value: pn.notes });

  embed.setFooter({ text: `Patch Note #${pn.numero} • ${pn.date} • Amity Bot` });

  return embed;
}

async function collect(channel, userId, timeout = 60000) {
  try {
    const msgs = await channel.awaitMessages({
      filter: m => m.author.id === userId,
      max: 1, time: timeout, errors: ['time'],
    });
    return msgs.first();
  } catch {
    return null;
  }
}

function infoEmbed(desc, color = "#5865F2") {
  return new EmbedBuilder().setDescription(desc).setColor(color);
}

function stepEmbed(step, total, titre, desc) {
  return new EmbedBuilder()
    .setTitle(`Étape ${step}/${total} — ${titre}`)
    .setDescription(desc)
    .setColor("#5865F2")
    .setFooter({ text: "Envoie 'annuler' pour stopper." });
}

async function collectList(channel, userId, step, total, titre, desc) {
  await channel.send({ embeds: [stepEmbed(step, total, titre, desc)] });
  const items = [];

  while (true) {
    const r = await collect(channel, userId, 120000);
    if (!r) return items;

    const val = r.content.trim();
    if (val.toLowerCase() === "annuler") return null;
    if (val.toLowerCase() === "fin" || val.toLowerCase() === "skip") break;

    items.push(val);
    await r.react("✅").catch(() => {});
    await channel.send({ embeds: [infoEmbed(
      `**${items.length} élément(s) ajouté(s) :**\n${items.map((c, i) => `\`${i + 1}.\` ${c}`).join("\n")}\n\nContinue ou envoie \`fin\`.`
    )] });
  }

  return items;
}

// ════════════════════════════════════════════════════════════════
// 📦 COMMANDE
// ════════════════════════════════════════════════════════════════
export default {
  name: "patchnote",
  description: "Affiche ou publie les patch notes du serveur",

  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const { channel, author, member, client } = message;

    const cancel = async () => {
      sessions.delete(author.id);
      await channel.send({ embeds: [infoEmbed("❌ **Création annulée.**", "#ff7675")] });
    };

    // ── +patchnote add ────────────────────────────────────────
    if (sub === "add") {
      if (!member.permissions.has(PermissionFlagsBits.ManageGuild))
        return message.reply("❌ Tu n'as pas la permission de publier une patch note.");

      if (sessions.has(author.id))
        return message.reply("⚠️ Session déjà en cours. Envoie `annuler` pour l'arrêter.");

      sessions.set(author.id, true);
      const pn = { numero: null, titre: null, description: null, ajouts: [], modifications: [], corrections: [], notes: null };

      // Étape 1 — Numéro
      await channel.send({ embeds: [stepEmbed(1, 7, "Numéro",
        `Quel est le numéro de cette patch note ?\nProchain numéro suggéré : **${PATCHNOTES.length + 1}**`
      )] });
      const r1 = await collect(channel, author.id);
      if (!r1 || r1.content.toLowerCase() === "annuler") return cancel();
      if (!/^\d+$/.test(r1.content.trim())) {
        sessions.delete(author.id);
        return channel.send({ embeds: [infoEmbed("❌ Envoie juste un chiffre. Relance avec `+patchnote add`.", "#ff7675")] });
      }
      pn.numero = r1.content.trim();

      // Étape 2 — Titre
      await channel.send({ embeds: [stepEmbed(2, 7, "Titre",
        `Patch Note **#${pn.numero}**\n\nDonne un titre.\n**Exemple :** \`Mise à jour de Noël 🎄\``
      )] });
      const r2 = await collect(channel, author.id);
      if (!r2 || r2.content.toLowerCase() === "annuler") return cancel();
      pn.titre = r2.content.trim();

      // Étape 3 — Description
      await channel.send({ embeds: [stepEmbed(3, 7, "Description",
        `**#${pn.numero}** — *${pn.titre}*\n\nEcris une courte description générale.\n**Exemple :** \`Grosse mise à jour avec plein de nouveautés !\``
      )] });
      const r3 = await collect(channel, author.id);
      if (!r3 || r3.content.toLowerCase() === "annuler") return cancel();
      pn.description = r3.content.trim();

      // Étape 4 — Ajouts
      const ajouts = await collectList(channel, author.id, 4, 7, "✨ Ajouts",
        "Envoie les ajouts **un par message**.\nEnvoie `fin` quand tu as terminé, `skip` s'il n'y en a pas.\n\n**Exemple :** `✨ Nouveau salon #général-2`"
      );
      if (ajouts === null) return cancel();
      pn.ajouts = ajouts;

      // Étape 5 — Modifications
      const modifs = await collectList(channel, author.id, 5, 7, "🔧 Modifications",
        "Envoie les modifications **un par message**.\nEnvoie `fin` ou `skip`.\n\n**Exemple :** `🔧 Refonte du système de tickets`"
      );
      if (modifs === null) return cancel();
      pn.modifications = modifs;

      // Étape 6 — Corrections
      const correcs = await collectList(channel, author.id, 6, 7, "🐛 Corrections",
        "Envoie les corrections de bugs **un par message**.\nEnvoie `fin` ou `skip`.\n\n**Exemple :** `🐛 Fix du bug de la commande +mute`"
      );
      if (correcs === null) return cancel();
      pn.corrections = correcs;

      // Étape 7 — Note du staff
      await channel.send({ embeds: [stepEmbed(7, 7, "📌 Note du staff",
        "Veux-tu ajouter un message personnel ?\nEnvoie ton message ou `skip` pour ignorer."
      )] });
      const r7 = await collect(channel, author.id);
      if (!r7 || r7.content.toLowerCase() === "annuler") return cancel();
      pn.notes = r7.content.toLowerCase() === "skip" ? null : r7.content.trim();

      // Aperçu + confirmation
      const preview = buildEmbed({ ...pn, date: dateNow() });
      preview.setFooter({ text: "Réponds 'oui' pour publier, 'non' pour annuler." });
      await channel.send({ content: "**Voici l'aperçu de ta patch note :**", embeds: [preview] });

      const confirm = await collect(channel, author.id);
      if (!confirm || confirm.content.toLowerCase() !== "oui") return cancel();

      // Enregistrement
      const newPN = { ...pn, date: dateNow() };
      PATCHNOTES.unshift(newPN);
      sessions.delete(author.id);

      // Publication dans le salon dédié
      const pnChannel = client.channels.cache.get(SALON_ID);
      if (pnChannel) {
        await pnChannel.send({
          content: "@everyone 📰 **Nouvelle Patch Note disponible !**",
          embeds: [buildEmbed(newPN)],
        });
        return channel.send({ embeds: [infoEmbed(`✅ Patch Note **#${pn.numero}** publiée dans <#${SALON_ID}> !`, "#00b894")] });
      } else {
        return channel.send({ embeds: [infoEmbed(`✅ Patch Note **#${pn.numero}** enregistrée.\n⚠️ Salon introuvable — vérifie \`SALON_ID\` dans le fichier.`, "#fdcb6e")] });
      }
    }

    // ── +patchnote <numéro> ───────────────────────────────────
    if (sub && !isNaN(sub)) {
      const pn = PATCHNOTES.find(p => p.numero === sub);
      if (!pn)
        return message.reply(`❌ Patch Note \`#${sub}\` introuvable. Disponibles : ${PATCHNOTES.map(p => `\`#${p.numero}\``).join(", ")}`);
      return channel.send({ embeds: [buildEmbed(pn)] });
    }

    // ── +patchnote ────────────────────────────────────────────
    if (!PATCHNOTES.length)
      return message.reply("📰 Aucune patch note pour l'instant. Utilise `+patchnote add`.");

    const latest = PATCHNOTES[0];
    return channel.send({ embeds: [
      new EmbedBuilder()
        .setTitle("📰 Patch Notes du serveur")
        .setColor("#a29bfe")
        .setDescription(`Dernière patch note : **#${latest.numero}** — *${latest.titre}* • ${latest.date}\n\`+patchnote <numéro>\` pour le détail • \`+patchnote add\` pour publier`)
        .addFields({
          name: "📋 Historique",
          value: PATCHNOTES.map(p => `\`#${p.numero}\` — **${p.titre}** • ${p.date}`).join("\n"),
        })
        .setFooter({ text: `${PATCHNOTES.length} patch note(s) • Amity Bot` })
        .setTimestamp(),
    ] });
  },
};