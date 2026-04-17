import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'absencestaff',
  description: 'Affiche un exemple de message d\'absence staff',

  async execute(message, args) {

    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return message.reply('❌ Tu n\'as pas la permission d\'utiliser cette commande.');

    message.delete().catch(() => {});

    // ── EMBED 1 — EXPLICATION ─────────────────────────────────
    const embedExplication = new EmbedBuilder()
      .setColor('#3498DB')
      .setAuthor({
        name: 'Amity  ·  Absences Staff',
        iconURL: message.guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTitle('📋  Comment signaler une absence ?')
      .setDescription(
        `> Toute absence de **plus de 3 jours** doit être signalée dans ce salon.\n` +
        `> Cela permet à l'équipe de s'organiser et d'éviter les malentendus.\n` +
        `> **Copie le modèle ci-dessous** et complète-le avec tes informations.\n`
      )
      .addFields(
        {
          name: '✅  Quand poster ?',
          value:
            `**·** Avant toute absence prévue (vacances, examens, travail...)\n` +
            `**·** En cas d'absence imprévue, dès que possible\n` +
            `**·** Même pour une absence partielle (disponibilité réduite)`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },
        {
          name: '❌  Ce qui n\'est pas acceptable',
          value:
            `**·** Disparaître sans prévenir pendant plusieurs jours\n` +
            `**·** Ne pas respecter les délais de réponse sans explication\n` +
            `**·** Poster une absence après coup`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },
        {
          name: '📌  Modèle à utiliser',
          value: '```\n' +
            '[ ABSENCE STAFF ]\n\n' +
            '👤 Pseudo        : Ton pseudo\n' +
            '📅 Début         : JJ/MM/AAAA\n' +
            '📅 Fin prévue    : JJ/MM/AAAA\n' +
            '📝 Raison        : (optionnel)\n' +
            '📱 Joignable     : Oui / Non / Partiellement\n' +
            '💬 Infos suppl.  : (optionnel)\n' +
            '```',
          inline: false,
        },
      )
      .setFooter({
        text: 'Amity  ·  Absences Staff  ·  Merci de respecter cette procédure',
        iconURL: message.guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    // ── EMBED 2 — EXEMPLE REMPLI ──────────────────────────────
    const embedExemple = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅  Exemple de message d\'absence')
      .setDescription(
        `> Voici à quoi doit ressembler ton message une fois complété.\n`
      )
      .addFields(
        {
          name: '📩  Message exemple',
          value: '```\n' +
            '[ ABSENCE STAFF ]\n\n' +
            '👤 Pseudo        : Klauss\n' +
            '📅 Début         : 24/03/2026\n' +
            '📅 Fin prévue    : 30/03/2026\n' +
            '📝 Raison        : Vacances en famille\n' +
            '📱 Joignable     : Partiellement (soirs uniquement)\n' +
            '💬 Infos suppl.  : Je reste dispo sur Discord si urgence\n' +
            '```',
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },
        {
          name: '⚠️  Rappel',
          value:
            `Une absence non signalée peut être considérée comme un **abandon de poste**.\n` +
            `En cas de doute, contacte un administrateur directement.`,
          inline: false,
        },
      )
      .setFooter({
        text: 'Amity  ·  Absences Staff  ·  Exemple non contractuel',
        iconURL: message.guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embedExplication] });
    await message.channel.send({ embeds: [embedExemple] });
  },
};