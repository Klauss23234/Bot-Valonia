import { EmbedBuilder } from 'discord.js';

const CONFIG = {
  serverName: 'Valonia',
};

export default {
  name: 'setupstaff',
  description: 'Déploie la présentation du staff',

  async execute(message, args, client) {

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle(`👑  NOTRE STAFF — ${CONFIG.serverName}`)
      .setDescription(
        `On va pas faire compliqué.\n` +
        `Derrière le serveur, y’a juste une équipe qui s’occupe que tout se passe bien.\n` +
        `On est là pour gérer, aider et garder une bonne ambiance.`
      )

      .addFields(

        {
          name: '🛠️  Ce qu’on fait',
          value:
            `On s’occupe du serveur au quotidien.\n` +
            `Modération, organisation, gestion des problèmes…\n` +
            `Bref, on fait tourner tout ça proprement.`,
          inline: false,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        {
          name: '🤝  Notre objectif',
          value:
            `Garder un serveur **actif, chill et respectueux**.\n` +
            `Que tout le monde puisse venir tranquille sans prise de tête.`,
          inline: false,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        {
          name: '💬  Besoin d’aide ?',
          value:
            `Si t’as un souci, une question ou un problème,\n` +
            `viens nous voir directement.\n` +
            `On est là pour ça.`,
          inline: false,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        {
          name: '⚠️  Petit rappel',
          value:
            `On est cool, mais on fait respecter les règles.\n` +
            `Si ça part en vrille, on intervient.\n` +
            `Donc respectez le règlement et tout ira bien 👍`,
          inline: false,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        {
          name: '🚀  Rejoindre le staff',
          value:
            `Tu veux aider le serveur ?\n` +
            `On ouvre parfois des recrutements.\n` +
            `Reste actif et montre que t’es sérieux 😉`,
          inline: false,
        },

      )
      .setFooter({ text: `${CONFIG.serverName} · une équipe simple, mais efficace.` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};