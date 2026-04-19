import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  name: 'firstmessage',
  description: 'Affiche le premier message du salon',
  aliases: ['first', 'firstmsg', 'fm'],
  async execute(message) {
    await message.channel.sendTyping();

    try {
      // Récupérer les messages les plus anciens
      const fetchedMessages = await message.channel.messages.fetch({ 
        after: '1', // Discord ne permet pas fetch "oldest first", donc after: '1' récupère le tout premier
        limit: 1 
      });

      if (fetchedMessages.size === 0) {
        return message.reply('❌ Impossible de trouver le premier message de ce salon.');
      }

      const firstMessage = fetchedMessages.first();

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({ 
          name: firstMessage.author.tag, 
          iconURL: firstMessage.author.displayAvatarURL({ dynamic: true }) 
        })
        .setDescription(firstMessage.content || '*Aucun contenu*')
        .addFields(
          { 
            name: '📅 Date', 
            value: `<t:${Math.floor(firstMessage.createdTimestamp / 1000)}:F>\n<t:${Math.floor(firstMessage.createdTimestamp / 1000)}:R>`, 
            inline: true 
          },
          { 
            name: '🆔 ID', 
            value: `\`${firstMessage.id}\``, 
            inline: true 
          }
        )
        .setFooter({ text: `Premier message de #${message.channel.name}` })
        .setTimestamp(firstMessage.createdTimestamp);

      // Ajouter une image si présente
      if (firstMessage.attachments.size > 0) {
        const attachment = firstMessage.attachments.first();
        if (attachment.contentType?.startsWith('image/')) {
          embed.setImage(attachment.url);
        }
      }

      // Bouton pour aller au message
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Aller au message')
            .setURL(firstMessage.url)
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗')
        );

      message.reply({ embeds: [embed], components: [row] });

    } catch (error) {
      console.error('Erreur firstmessage:', error);
      message.reply('❌ Une erreur est survenue lors de la récupération du premier message.');
    }
  }
};
