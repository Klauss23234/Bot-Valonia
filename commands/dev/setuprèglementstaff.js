import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'rulestaff',
  description: 'Affiche les règles du staff',

  async execute(message, args) {

    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return message.reply('❌ Tu n\'as pas la permission d\'utiliser cette commande.');

    message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setColor('#0059ff')
      .setAuthor({
        name: 'Amity  ·  Charte du Staff',
        iconURL: message.guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTitle('📜  Charte Officielle du Staff')
      .setDescription(
        `> En intégrant l'équipe **Amity**, tu acceptes cette charte dans son intégralité.\n` +
        `> Elle définit les standards attendus de chaque membre du staff.\n` +
        `> **Son non-respect entraîne des sanctions immédiates.**\n`
      )
      .addFields(

        // ── BLOC 1 ───────────────────────────────────────────
        {
          name: '🤝  Respect & Éthique',
          value:
            `Chaque membre du staff se doit d'incarner les valeurs du serveur.\n` +
            `**·** Attitude respectueuse envers tous, sans exception\n` +
            `**·** Zéro tolérance pour l'abus de pouvoir ou le favoritisme\n` +
            `**·** Rester professionnel, même face à des membres difficiles`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },

        // ── BLOC 2 ───────────────────────────────────────────
        {
          name: '🔒  Confidentialité Absolue',
          value:
            `Ce qui se passe dans le staff, **reste dans le staff**.\n` +
            `**·** Aucune divulgation de sanctions, débats ou décisions internes\n` +
            `**·** Ne jamais partager les outils ou accès staff à un tiers\n` +
            `**·** Toute fuite volontaire = retrait immédiat et définitif`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },

        // ── BLOC 3 ───────────────────────────────────────────
        {
          name: '⏰  Présence & Engagement',
          value:
            `Le staff est un rôle actif, pas un titre honorifique.\n` +
            `**·** Présence régulière attendue sur le serveur\n` +
            `**·** Répondre aux signalements et tickets dans les meilleurs délais\n` +
            `**·** Toute absence prolongée doit être signalée à l'avance`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },

        // ── BLOC 4 ───────────────────────────────────────────
        {
          name: '⚖️  Décisions & Modération',
          value:
            `Chaque action engage la réputation de l'équipe entière.\n` +
            `**·** Agir avec discernement, sans précipitation\n` +
            `**·** Consulter l'équipe avant toute décision complexe\n` +
            `**·** Documenter les sanctions importantes pour la traçabilité`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },

        // ── BLOC 5 ───────────────────────────────────────────
        {
          name: '💬  Communication d\'Équipe',
          value:
            `Une équipe qui communique est une équipe qui fonctionne.\n` +
            `**·** Utiliser les salons staff dédiés pour toute discussion interne\n` +
            `**·** Partager les informations utiles sans attendre qu'on les demande\n` +
            `**·** Exprimer ses désaccords en privé, jamais en public`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },

        // ── BLOC 6 ───────────────────────────────────────────
        {
          name: '🚨  Sanctions Internes',
          value:
            `Les manquements à cette charte sont traités avec sérieux.\n\n` +
            `\`  1  \` **Avertissement** — rappel à l'ordre formel\n` +
            `\`  2  \` **Suspension temporaire** des accès staff\n` +
            `\`  3  \` **Retrait définitif** du rôle sans appel possible`,
          inline: false,
        },
        { name: '\u200b', value: '\u200b', inline: false },

        // ── RAPPEL FINAL ─────────────────────────────────────
        {
          name: '⚠️  À retenir',
          value:
            `> Être staff chez **Amity** est un **privilège accordé**, pas un droit acquis.\n` +
            `> Tu représentes le serveur à chaque instant — chacune de tes actions a un impact.\n` +
            `> Si tu as un doute sur une décision, **demande avant d'agir**.`,
          inline: false,
        },

      )
      .setImage('https://i.imgur.com/placeholder_staff_banner.png') // Optionnel : bannière staff
      .setFooter({
        text: `Amity  ·  Charte Staff  ·  Signée à ton arrivée dans l'équipe`,
        iconURL: message.guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};