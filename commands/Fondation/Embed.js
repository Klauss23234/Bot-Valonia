import { PermissionsBitField, EmbedBuilder } from 'discord.js';

export default {
  name: 'embed',
  aliases: ['embeds'],
  description: 'Gestion des embeds du serveur',
  usage: '<rules|send|announce|help>',
  category: 'Staff',
  permissions: ['ManageMessages'],

  async execute(message, args) {

    const sub = args.shift()?.toLowerCase();

    if (!sub) {
      return message.reply("❌ Sous-commande manquante. (`embed help`)");
    }

    switch (sub) {

      // =====================
      // RULES (RÈGLEMENT STYLE SCREEN)
      // =====================
      case 'rules': {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return message.reply("❌ Permission requise : ManageMessages");
        }

        const embed = new EmbedBuilder()
          .setColor('#3E5F57')
          .setTitle('**__Bienvenue sur le discord !__**')
          .setDescription(
`Voici quelques règles à respecter en venant sur le serveur :

> │ Le respect **des autres membres** est primordial, peu importe **la situation** !

> │ Pas de **langage vulgaire** !

> │ Respecter le **sujet de chaque salon** !

> │ Pas d'embrouilles, **vos problèmes** ne doivent pas être visibles aux yeux de **tous** !

> │ Si vous avez des questions, merci d'aller ouvrir un **#🎟️・ouvrir-un-ticket** !`
          )
          // Remplace les liens ci-dessous par les tiens
          .setThumbnail('https://i.imgur.com/TON_LOGO.png')
          .setImage('https://i.imgur.com/TON_IMAGE.png');

        return message.channel.send({ embeds: [embed] });
      }

      // =====================
      // SEND (EMBED PERSONNALISÉ)
      // =====================
      case 'send': {

        const title = args.shift();
        const description = args.join(' ');

        if (!title || !description) {
          return message.reply("❌ Usage: `embed send <titre> <description>`");
        }

        const embed = new EmbedBuilder()
          .setColor('#7B2CBF')
          .setTitle(title)
          .setDescription(description)
          .setFooter({ text: `Demandé par ${message.author.tag}` })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      }

      // =====================
      // ANNOUNCE (STAFF)
      // =====================
      case 'announce': {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return message.reply("❌ Permission requise : ManageMessages");
        }

        const description = args.join(' ');
        if (!description) {
          return message.reply("❌ Usage: `embed announce <message>`");
        }

        const embed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle("🚨 ANNONCE")
          .setDescription(description)
          .setFooter({ text: "AMITY • Annonce Officielle" })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      }

      // =====================
      // HELP
      // =====================
      case 'help': {
        return message.reply(
          '📘 Liste complète des commandes disponible en bas du fichier `Embed.js`.'
        );
      }

      // =====================
      // DEFAULT
      // =====================
      default:
        return message.reply("❌ Sous-commande inconnue. (`embed help`)");
    }
  }
};

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 COMMANDES EMBED DISPONIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📜 Règlement
- embed rules                         → Envoie le règlement stylé

📢 Envoi personnalisé
- embed send <titre> <description>    → Envoie un embed simple

🚨 Annonce (STAFF)
- embed announce <message>            → Envoie une annonce officielle

🧠 Utilitaire
- embed help                          → Aide embed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/