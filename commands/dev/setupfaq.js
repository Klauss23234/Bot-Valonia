import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const CONFIG = {
  serverName: 'Amity',
  salons: {
    annonces:    '<#ID_ANNONCES>',
    regles:      '<#ID_REGLES>',
    general:     '<#ID_GENERAL>',
    bot:         '<#ID_BOT>',
    suggestions: '<#ID_SUGGESTIONS>',
    tickets:     '<#ID_TICKETS>',
    recrutement: '<#ID_RECRUTEMENT>',
    roles:       '<#ID_ROLES>',
  },
};

const S = CONFIG.salons;

export default {
  name: 'setupfaq',
  description: 'Déploie la FAQ en un seul embed propre',

  async execute(message, args, client) {

    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
      return message.reply('❌ Tu n\'as pas la permission.');

    message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📖  FAQ — ${CONFIG.serverName}`)
      .setDescription(
        `Bienvenue ! Voici tout ce que tu dois savoir pour profiter du serveur.\n`
      )
      .addFields(

        // ── SALONS CACHÉS ─────────────────────────────────────
        {
          name: '👁️  Tu ne vois pas tous les salons ?',
          value:
            `Il est possible que certains salons soient cachés sur ta liste.\n` +
            `Voici comment les afficher :\n\n` +
            `**1.** Fais un **clic droit** sur le nom du serveur\n` +
            `**2.** Clique sur **"Paramètres de notification"**\n` +
            `**3.** Tout en bas, active **"Montrer tous les salons"**\n\n` +
            `> ✅ Tous les salons accessibles apparaîtront instantanément.`,
          inline: false,
        },

        // ── SÉPARATEUR ────────────────────────────────────────
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },

        // ── SALONS ────────────────────────────────────────────
        {
          name: '📋  Les Salons',
          value:
            `${S.annonces} — Annonces et actualités\n` +
            `${S.regles} — Règlement du serveur\n` +
            `${S.general} — Discussion générale\n` +
            `${S.bot} — Commandes du bot\n` +
            `${S.suggestions} — Propose tes idées\n` +
            `${S.tickets} — Contacter le staff\n` +
            `${S.recrutement} — Rejoindre l'équipe`,
          inline: false,
        },

        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },

        // ── RÔLES ─────────────────────────────────────────────
        {
          name: '🎭  Les Rôles',
          value:
            `Récupère tes rôles dans ${S.roles}.\n` +
            `Tape \`+rank\` pour voir ta progression d'activité.`,
          inline: true,
        },

        // ── BOT ───────────────────────────────────────────────
        {
          name: '🤖  Le Bot',
          value:
            `Préfixe \`+\`\n` +
            `Tape \`+help\` pour voir toutes les commandes.`,
          inline: true,
        },

        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },

        // ── RÈGLES ────────────────────────────────────────────
        {
          name: '🛡️  Les Règles',
          value:
            `**·** Respect mutuel entre membres\n` +
            `**·** Pas de spam, insultes ou pub\n` +
            `**·** Utilise les bons salons\n` +
            `**·** Règlement complet → ${S.regles}`,
          inline: true,
        },

        // ── SUPPORT ───────────────────────────────────────────
        {
          name: '🎫  Support',
          value:
            `Besoin d'aide ? → ${S.tickets}\n` +
            `Signaler : \`+report ID\`\n` +
            `Ne DM pas le staff directement.`,
          inline: true,
        },

      )
      .setFooter({ text: `${CONFIG.serverName}  ·  FAQ Officielle  ·  Lis bien avant de demander au staff 😉` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};