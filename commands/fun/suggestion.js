import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const suggestions = new Map();
let suggestionCounter = 0;

export default {
  name: 'suggest-simple',
  description: 'Crée une suggestion (version simple avec texte)',
  aliases: ['suggestion-simple', 'sgs'],
  usage: '<ta suggestion>',
  args: true,

  async execute(message, args, client) {

    const suggestionText = args.join(' ').trim();

    if (!suggestionText || suggestionText.length < 10) {
      return message.reply('❌ Ta suggestion doit faire au moins **10 caractères**.');
    }

    if (suggestionText.length > 1000) {
      return message.reply('❌ Ta suggestion ne peut pas dépasser **1000 caractères**.');
    }

    // Salon par défaut
    let suggestionChannel = message.channel;

    // Vérifie si une config existe
    const setupCmd = client.commands?.get('suggest-setup');

    if (setupCmd && typeof setupCmd.getConfig === "function") {
      const config = setupCmd.getConfig(message.guild.id);

      if (config?.channel) {
        const channel = message.guild.channels.cache.get(config.channel);
        if (channel) suggestionChannel = channel;
      }
    }

    suggestionCounter++;
    const suggestionId = suggestionCounter;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setAuthor({
        name: `Suggestion #${suggestionId} - ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setDescription(`**💡 Suggestion :**\n${suggestionText}`)
      .addFields(
        { name: '👤 Auteur', value: `${message.author}`, inline: true },
        { name: '📊 Statut', value: '🟡 En attente', inline: true },
        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setFooter({ text: `Suggestion ID: ${suggestionId}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(`suggest_upvote_${suggestionId}`)
        .setEmoji('👍')
        .setLabel('0')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`suggest_downvote_${suggestionId}`)
        .setEmoji('👎')
        .setLabel('0')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`suggest_info_${suggestionId}`)
        .setEmoji('ℹ️')
        .setLabel('Infos')
        .setStyle(ButtonStyle.Secondary)

    );

    try {

      const suggestionMsg = await suggestionChannel.send({
        embeds: [embed],
        components: [row]
      });

      // sauvegarde
      suggestions.set(suggestionId, {
        id: suggestionId,
        messageId: suggestionMsg.id,
        channelId: suggestionChannel.id,
        authorId: message.author.id,
        content: suggestionText,
        status: 'pending',
        upvotes: new Set(),
        downvotes: new Set(),
        createdAt: Date.now(),
        staffResponse: null
      });

      await message.delete().catch(() => {});

      const confirmEmbed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Suggestion envoyée')
        .setDescription(`Ta suggestion **#${suggestionId}** a été publiée dans ${suggestionChannel}`)
        .setTimestamp();

      const confirmMsg = await message.channel.send({ embeds: [confirmEmbed] });

      setTimeout(() => {
        confirmMsg.delete().catch(() => {});
      }, 10000);

    } catch (error) {

      console.error("Erreur suggestion:", error);

      message.reply("❌ Impossible d'envoyer la suggestion.");

    }
  },

  // Fonctions utiles
  getSuggestion(id) {
    return suggestions.get(id);
  },

  getAllSuggestions() {
    return suggestions;
  },

  updateSuggestion(id, data) {
    suggestions.set(id, data);
  }
};