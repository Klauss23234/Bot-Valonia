import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const marriages = new Map();

export default {
  name: 'marry',
  description: 'Demande quelqu\'un en mariage sur le serveur',
  usage: '@user',
  category: 'fun',

  async execute(message, args, client) {
    try {
      const target = message.mentions.users.first();
      if (!target) return message.reply('❌ Mentionne quelqu\'un ! `+marry @user`');
      if (target.id === message.author.id) return message.reply('💔 Tu ne peux pas t\'épouser toi-même !');
      if (target.bot) return message.reply('🤖 Les bots ne font pas de mariage !');

      const myPartner = marriages.get(message.author.id);
      if (myPartner) {
        const p = await client.users.fetch(myPartner).catch(() => null);
        return message.reply(`💍 Tu es déjà marié(e) avec **${p?.username ?? 'quelqu\'un'}** ! Utilise \`+divorce\` d'abord.`);
      }

      const theirPartner = marriages.get(target.id);
      if (theirPartner) {
        const p = await client.users.fetch(theirPartner).catch(() => null);
        return message.reply(`💔 **${target.username}** est déjà marié(e) avec **${p?.username ?? 'quelqu\'un'}** !`);
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('marry_yes').setLabel('💍 Oui, je le veux !').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('marry_no').setLabel('💔 Non merci').setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor('Gold')
        .setTitle('💍 Demande en mariage !')
        .setDescription(`**${message.author.username}** demande **${target.username}** en mariage ! 🌹\n\n${target}, acceptes-tu ?`)
        .setFooter({ text: '30 secondes pour répondre', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const msg = await message.channel.send({ content: `${target}`, embeds: [embed], components: [row] });

      const collector = msg.createMessageComponentCollector({
        filter: i => ['marry_yes', 'marry_no'].includes(i.customId) && i.user.id === target.id,
        time: 30000,
        max: 1,
      });

      collector.on('collect', async i => {
        if (i.customId === 'marry_yes') {
          marriages.set(message.author.id, target.id);
          marriages.set(target.id, message.author.id);
          const ok = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('🎉 Félicitations !')
            .setDescription(`**${message.author.username}** 💍 **${target.username}**\n\nVous êtes maintenant mariés sur ce serveur ! 🥂`)
            .setFooter({ text: 'Jusqu\'au prochain +divorce 😅' })
            .setTimestamp();
          await i.update({ embeds: [ok], components: [] });
        } else {
          const no = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`💔 **${target.username}** a refusé la demande de **${message.author.username}**. Brutal.`)
            .setTimestamp();
          await i.update({ embeds: [no], components: [] });
        }
      });

      collector.on('end', (col, reason) => {
        if (reason === 'time') {
          const timeout = new EmbedBuilder()
            .setColor('Grey')
            .setDescription(`⏰ **${target.username}** n'a pas répondu. Demande expirée.`)
            .setTimestamp();
          msg.edit({ embeds: [timeout], components: [] });
        }
      });

    } catch (error) {
      console.error('Erreur marry :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  },

  marriages,
};