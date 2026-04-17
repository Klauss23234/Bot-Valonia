import { EmbedBuilder } from 'discord.js';

const CONFIG = {
  serverName: 'Valonia',
  color: '#5865F2',
  salons: {
    general:     '<#1489722748082323547>',
    suggestions: '<#1489722775248699470>',
    tickets:     '<#1489722773717647455>',
    recrutement: '<#1489722756013625500>',
  },
};

const { salons: S, serverName, color } = CONFIG;

const SEPARATOR = { name: '\u200b', value: '\u200b', inline: false };

const FIELDS = [
  {
    name: '💬  Une commu active',
    value: [
      'On veut éviter le serveur mort où personne parle.',
      'Chacun participe un minimum, lance des discussions, répond aux autres.',
      "C'est comme ça que le serveur vit.\n",
      `> Viens discuter → ${S.general}`,
    ].join('\n'),
  },
  {
    name: '😌  Une ambiance chill',
    value: [
      'Ici pas de pression.',
      'Tu peux parler tranquille, rigoler, ou juste passer du temps.',
      "Le but c'est que tout le monde se sente bien.",
    ].join('\n'),
  },
  {
    name: '🛡️  Respect du règlement',
    value: [
      'On demande juste un truc important : le respect.',
      "Pas d'insultes gratuites, pas de drama inutile.",
      "Si tout le monde respecte ça, tout se passe bien.\n",
      `> Un problème ? → ${S.tickets}`,
    ].join('\n'),
  },
  {
    name: '💡  Des idées et des projets',
    value: [
      'Le serveur peut évoluer avec vous.',
      "Si t'as une idée ou un projet, tu peux le proposer.",
      "On voit ensemble ce qu'on peut mettre en place.\n",
      `> Propose ici → ${S.suggestions}`,
    ].join('\n'),
  },
  {
    name: '🚀  Faire évoluer le serveur',
    value: [
      'On veut améliorer le serveur petit à petit.',
      "Avec une bonne commu, des events, et des nouveautés.\n",
      `> S'impliquer → ${S.recrutement}`,
    ].join('\n'),
  },
];

export default {
  name: 'setupobjectives',
  description: `Déploie l'embed des objectifs du serveur ${serverName}`,

  async execute(message) {
    const fields = [];
    for (let i = 0; i < FIELDS.length; i++) {
      fields.push(FIELDS[i]);
      if (i < FIELDS.length - 1) {
        fields.push(SEPARATOR);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🌿  Nos projets — ${serverName}`)
      .setDescription(
        "On va faire simple.\n" +
        "Le but ici c'est d'avoir un serveur **actif, chill et respectueux**.\n" +
        "Un endroit où tu viens tranquille, sans pression, et où ça parle vraiment."
      )
      .addFields(fields)
      .setFooter({ text: `${serverName} · un serveur simple, mais solide.` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};