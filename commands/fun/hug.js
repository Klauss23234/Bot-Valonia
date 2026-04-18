import { EmbedBuilder } from 'discord.js';

const gifs = [
  'https://media.tenor.com/od_DPGPINGsAAAAC/anime-hug.gif',
  'https://media.tenor.com/VFsRSM3skLwAAAAC/hug-anime.gif',
  'https://media.tenor.com/SUn_HEzSxRQAAAAC/hug.gif',
];

export default {
  name: 'hug',
  description: 'Envoie un gif de câlin',
  usage: '@user',
  category: 'fun',

  execute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('❌ Mentionne quelqu\'un ! `+hug @user`');

      const lines = [
        `🤗 **${message.author.username}** fait un câlin à **${target.username}** !`,
        `💞 **${message.author.username}** serre **${target.username}** dans ses bras !`,
        `🥰 **${message.author.username}** offre un gros câlin à **${target.username}** !`,
      ];

      const gif = gifs[Math.floor(Math.random() * gifs.length)];

      const embed = new EmbedBuilder()
        .setColor('Pink')
        .setDescription(lines[Math.floor(Math.random() * lines.length)])
        .setImage(gif)
        .setFooter({ text: '💕 Trop mignon !', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur hug :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};