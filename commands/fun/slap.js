import { EmbedBuilder } from 'discord.js';

const gifs = [
  'https://media.tenor.com/lZAGugDdRMAAAAAC/anime-slap.gif',
  'https://media.tenor.com/lzRgRSNpPVIAAAAC/slap-anime.gif',
  'https://media.tenor.com/W-kZdFtxkGIAAAAC/slap.gif',
  'https://media.tenor.com/XNNhZLkBCmsAAAAC/anime-slap.gif',
  'https://media.tenor.com/PPdKRFDSad8AAAAC/slap-onepiece.gif',
];

const lines = [
  (a, t) => `👋 **${a}** gifle **${t}** de toutes ses forces !`,
  (a, t) => `💥 **${t}** reçoit une claque monumentale de **${a}** !`,
  (a, t) => `🌪️ **${a}** envoie sa main dans la face de **${t}** !`,
  (a, t) => `😤 **${a}** en avait marre de **${t}** et ça se voit !`,
  (a, t) => `🖐️ **${t}** vient de recevoir la baffe du siècle de la part de **${a}** !`,
  (a, t) => `💢 **${a}** perd patience et gifle **${t}** sans hésiter !`,
];

const damages = ['5', '12', '27', '43', '69', '99', '100 (critique !)'];

export default {
  name: 'slap',
  description: 'Envoie un gif de claque',
  async execute(message, args, client) {

    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Mentionne quelqu\'un ! `+slap @user`');
    if (target.id === message.author.id) return message.reply('🤦 Tu te gifles toi-même ? Skill issue.');
    if (target.id === client.user.id) return message.reply('😐 Tu essaies de me gifler moi ? Vraiment ?');

    const line = lines[Math.floor(Math.random() * lines.length)](message.author.username, target.username);
    const gif = gifs[Math.floor(Math.random() * gifs.length)];
    const dmg = damages[Math.floor(Math.random() * damages.length)];

    const embed = new EmbedBuilder()
      .setTitle('👋 SLAP !')
      .setColor('#FF0000')
      .setDescription(line)
      .setImage(gif)
      .addFields(
        { name: '💢 Dégâts infligés', value: `**${dmg} HP**`, inline: true },
        { name: '🎯 Victime', value: `${target}`, inline: true },
      )
      .setFooter({ text: `Slap délivré par ${message.author.username} • Ouch ! 🤕`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};