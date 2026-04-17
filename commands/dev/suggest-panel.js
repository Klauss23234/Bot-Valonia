import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'suggest-panel',
  description: 'Crée le panel de suggestions compact et stylé',
  aliases: ['suggestion-panel', 'spanel'],
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args, client) {
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setAuthor({ 
        name: 'Système de Suggestions', 
        iconURL: message.guild.iconURL({ dynamic: true })
      })
      .setDescription('**💡 Tu as une idée pour améliorer le serveur ?**\n\nClique sur le bouton ci-dessous pour soumettre ta suggestion. La communauté pourra voter et le staff examinera les meilleures propositions !')
      .addFields(
        {
          name: '📝 Comment ça marche',
          value: '• Clique sur **Soumettre**\n• Remplis le formulaire\n• Ta suggestion est publiée\n• Les membres votent 👍 👎',
          inline: true
        },
        {
          name: '✅ Conseils',
          value: '• Sois clair et précis\n• Explique ton idée\n• Reste constructif\n• Une suggestion à la fois',
          inline: true
        }
      )
      .setFooter({ 
        text: `${message.guild.name} • Merci pour ta participation !`, 
        iconURL: message.guild.iconURL() 
      })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('suggestion_submit')
          .setLabel('Soumettre une suggestion')
          .setEmoji('💡')
          .setStyle(ButtonStyle.Success)
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('suggest_view_pending')
          .setLabel('Suggestions en attente')
          .setEmoji('🟡')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('suggest_view_accepted')
          .setLabel('Suggestions acceptées')
          .setEmoji('✅')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('suggest_top')
          .setLabel('Top suggestions')
          .setEmoji('🏆')
          .setStyle(ButtonStyle.Secondary)
      );
    
    // Supprimer le message de commande
    await message.delete().catch(() => {});
    
    // Envoyer le panel
    await message.channel.send({ 
      embeds: [embed], 
      components: [row, row2] 
    });
    
    // Confirmation
    const confirmEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setDescription('✅ Panel de suggestions créé avec succès !')
      .setTimestamp();
    
    message.channel.send({ embeds: [confirmEmbed] }).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    });
  }
};