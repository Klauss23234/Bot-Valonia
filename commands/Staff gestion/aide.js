import { EmbedBuilder, PermissionsBitField } from 'discord.js';

// =====================================================
// ⚙️ CONFIG
// =====================================================
const STAFF_ROLE_ID = '1489722616922112245'; // 👈 ID du rôle staff
// =====================================================

export default {
  name: 'aide',
  description: 'Affiche toutes les commandes du bot (staff uniquement)',

  async execute(message) {
    // ── Vérification staff ──
    if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
      return message.reply({ content: '❌ Cette commande est réservée au **staff**.', ephemeral: true });
    }

    // ── Embed principal ──
    const embed = new EmbedBuilder()
      .setTitle('📋  Commandes du bot — Guide complet')
      .setDescription([
        `> Bienvenue ${message.member} ! Voici toutes les commandes disponibles.`,
        '> Préfixe : **`+`**  •  Réservé au staff 🛡️',
      ].join('\n'))
      .setColor('#5865F2')
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 256 }))

      // ──────────────────────────────────────
      // 🎫 TICKETS
      // ──────────────────────────────────────
      .addFields(
        {
          name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎫  Système de Tickets',
          value: '\u200b',
        },
        {
          name: '`+ticket setup`',
          value: '> 📩 Envoie le panel d\'ouverture de ticket dans le salon actuel.\n> ⚠️ Nécessite `ManageChannels`.',
          inline: false,
        },
        {
          name: '`+ticket close`',
          value: '> 🔒 Ferme le ticket, génère un transcript HTML et affiche le panel de notation.\n> ⚠️ Nécessite `ManageChannels`.',
          inline: false,
        },
        {
          name: '`+ticket rename [nom]`',
          value: '> ✏️ Renomme le salon du ticket actuel.\n> 📌 Exemple : `+ticket rename remboursement`\n> ⚠️ Nécessite `ManageChannels`.',
          inline: false,
        },
        {
          name: '`+ticket claim`',
          value: '> 📌 Permet à un staff de **prendre en charge** le ticket.\n> ⚠️ Réservé au rôle Staff.',
          inline: false,
        },
        {
          name: '`+ticket mute @membre`',
          value: '> 🔇 Empêche un membre d\'écrire dans le ticket.\n> ⚠️ Nécessite `ManageChannels`.',
          inline: false,
        },
        {
          name: '`+ticket unmute @membre`',
          value: '> 🔊 Réautorise un membre à écrire dans le ticket.\n> ⚠️ Nécessite `ManageChannels`.',
          inline: false,
        },
        {
          name: '`+ticket transcript`',
          value: '> 📋 Génère manuellement un transcript HTML et l\'envoie dans les logs.\n> ⚠️ Nécessite `ManageChannels`.',
          inline: false,
        },
        {
          name: '`+ticket stats` / `+ticket stats @membre`',
          value: '> 📊 Affiche les stats d\'un membre staff (tickets gérés, moyenne de notes).\n> 💡 Utilise une mention ou un ID Discord.',
          inline: false,
        },

        // ──────────────────────────────────────
        // 🖱️ BOUTONS DANS LE TICKET
        // ──────────────────────────────────────
        {
          name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🖱️  Boutons dans le ticket',
          value: '\u200b',
        },
        {
          name: '📞 Appeler le staff',
          value: '> Mentionne le rôle staff pour demander de l\'aide.\n> ⏳ Cooldown **1 minute**.',
          inline: true,
        },
        {
          name: '🔺 Appeler un supérieur',
          value: '> Mentionne le rôle responsable pour escalader.\n> ⏳ Cooldown **2 minutes**.',
          inline: true,
        },
        {
          name: '➕ Ajouter un membre',
          value: '> Donne accès au ticket à un autre utilisateur via son ID.\n> ⚠️ Staff uniquement.',
          inline: true,
        },
        {
          name: '➖ Retirer un membre',
          value: '> Retire l\'accès au ticket à un utilisateur.\n> ⚠️ Staff uniquement.',
          inline: true,
        },
        {
          name: '🔒 Fermer le ticket',
          value: '> Ferme le ticket (propriétaire **ou** staff).\n> Une confirmation est demandée avant fermeture.',
          inline: true,
        },

        // ──────────────────────────────────────
        // 📚 FORUM
        // ──────────────────────────────────────
        {
          name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📚  Forum d\'aide',
          value: '\u200b',
        },
        {
          name: '`+help setup`',
          value: '> 🏗️ Crée le salon forum et génère tous les posts de documentation.',
          inline: false,
        },
        {
          name: '`+help refresh`',
          value: '> ♻️ Supprime et recrée tous les posts du forum (mise à jour).',
          inline: false,
        },
        {
          name: '`+help list`',
          value: '> 🔗 Liste les posts existants avec leurs liens.',
          inline: false,
        },

        // ──────────────────────────────────────
        // ⭐ NOTATION
        // ──────────────────────────────────────
        {
          name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⭐  Système de notation',
          value: [
            '> Après chaque fermeture de ticket, le membre peut noter son expérience de **1 à 5 étoiles**.',
            '> Le staff reçoit un **DM** avec sa note automatiquement.',
            '> Si aucune note n\'est donnée en **30 secondes**, le ticket est supprimé.',
          ].join('\n'),
        },
      )

      .setFooter({
        text: `${message.guild.name} • Staff only  |  Tape +aide pour revoir ce menu`,
        iconURL: message.guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
    await message.delete().catch(() => {});
  },
};