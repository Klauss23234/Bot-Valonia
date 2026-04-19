import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';

// ============================================
// ⚙️ CONFIG
// ============================================
const CONFIG = {
  PANEL_CHANNEL_ID:      '1489722775248699470', // 👈 Salon avec le bouton "Faire une suggestion"
  SUGGESTIONS_CHANNEL_ID:'1489722775248699470', // 👈 Salon où les suggestions apparaissent
  ADMIN_ROLE_ID:         '1489722614992601228', // 👈 Rôle qui peut gérer les suggestions
};
// ============================================

// 📌 Commande +suggestionpanel (envoie le panel)
export default {
  name: 'suggestionpanel',

  async execute(message, args, client) {
    if (message.author.id !== client.config.ownerId) return;

    const channel = message.guild.channels.cache.get(CONFIG.PANEL_CHANNEL_ID);
    if (!channel) return message.reply('❌ Salon introuvable.');

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💡 Suggestions')
      .setDescription(
        '> Tu as une idée pour améliorer le serveur ?\n' +
        '> N\'hésite pas à la soumettre, on lit tout ! 👀\n\n' +
        '**Conseils pour une bonne suggestion :**\n' +
        '> • Sois clair et précis\n' +
        '> • Explique pourquoi c\'est utile\n' +
        '> • Une idée par suggestion'
      )
      .setFooter({ text: 'VALONIA • Vos idées comptent 💙' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('faire_suggestion')
        .setLabel('💡 Faire une suggestion')
        .setStyle(ButtonStyle.Primary),
    );

    await channel.send({ embeds: [embed], components: [row] });
    await message.reply('✅ Panel suggestions envoyé !');
  }
};

// 📌 Gestion boutons + modals
export async function handleSuggestionInteraction(interaction) {

  // ═══════════════════════════════════════
  // 💡 Bouton "Faire une suggestion"
  // ═══════════════════════════════════════
  if (interaction.customId === 'faire_suggestion') {
    const modal = new ModalBuilder()
      .setCustomId('modal_suggestion')
      .setTitle('💡 Ta suggestion');

    const titreInput = new TextInputBuilder()
      .setCustomId('titre')
      .setLabel('Titre de ta suggestion')
      .setPlaceholder('Ex: Ajouter un salon gaming')
      .setStyle(TextInputStyle.Short)
      .setMinLength(5)
      .setMaxLength(100)
      .setRequired(true);

    const descInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Décris ta suggestion')
      .setPlaceholder('Explique ton idée en détail...')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(20)
      .setMaxLength(1000)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titreInput),
      new ActionRowBuilder().addComponents(descInput),
    );

    return await interaction.showModal(modal);
  }

  // ═══════════════════════════════════════
  // 📩 Soumission du modal
  // ═══════════════════════════════════════
  if (interaction.customId === 'modal_suggestion') {
    const titre = interaction.fields.getTextInputValue('titre').trim();
    const description = interaction.fields.getTextInputValue('description').trim();
    const { user, guild } = interaction;

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`💡 ${titre}`)
      .setDescription(`> ${description}`)
      .addFields(
        { name: '👤 Suggéré par', value: `${user}`, inline: true },
        { name: '📊 Statut', value: '🟡 En attente', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: '✅ Pour', value: '**0**', inline: true },
        { name: '❌ Contre', value: '**0**', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `ID: ${user.id} • VALONIA Suggestions` })
      .setTimestamp();

    const voteRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('vote_pour')
        .setLabel('✅ Pour (0)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('vote_contre')
        .setLabel('❌ Contre (0)')
        .setStyle(ButtonStyle.Danger),
    );

    const adminRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('suggestion_accepter')
        .setLabel('✔ Accepter')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('suggestion_encours')
        .setLabel('⏳ En cours')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('suggestion_refuser')
        .setLabel('✖ Refuser')
        .setStyle(ButtonStyle.Danger),
    );

    const suggestionsChannel = guild.channels.cache.get(CONFIG.SUGGESTIONS_CHANNEL_ID);
    if (!suggestionsChannel) return interaction.reply({ content: '❌ Salon suggestions introuvable.', ephemeral: true });

    await suggestionsChannel.send({ embeds: [embed], components: [voteRow, adminRow] });

    return interaction.reply({
      content: '✅ Ta suggestion a bien été envoyée ! Merci 💙',
      ephemeral: true,
    });
  }

  // ═══════════════════════════════════════
  // 📊 Votes
  // ═══════════════════════════════════════
  if (interaction.customId === 'vote_pour' || interaction.customId === 'vote_contre') {
    const message = interaction.message;
    const embed = EmbedBuilder.from(message.embeds[0]);
    const fields = embed.data.fields;

    const pourField  = fields.find(f => f.name === '✅ Pour');
    const contreField = fields.find(f => f.name === '❌ Contre');

    let pour   = parseInt(pourField.value.replace(/\*/g, '')) || 0;
    let contre = parseInt(contreField.value.replace(/\*/g, '')) || 0;

    if (interaction.customId === 'vote_pour')   pour++;
    if (interaction.customId === 'vote_contre') contre++;

    pourField.value   = `**${pour}**`;
    contreField.value = `**${contre}**`;

    const components = message.components.map(row => ActionRowBuilder.from(row));
    const voteRow = components[0];

    voteRow.components[0] = ButtonBuilder.from(voteRow.components[0]).setLabel(`✅ Pour (${pour})`);
    voteRow.components[1] = ButtonBuilder.from(voteRow.components[1]).setLabel(`❌ Contre (${contre})`);

    await message.edit({ embeds: [embed], components });

    return interaction.reply({
      content: interaction.customId === 'vote_pour' ? '✅ Vote **pour** enregistré !' : '❌ Vote **contre** enregistré !',
      ephemeral: true,
    });
  }

  // ═══════════════════════════════════════
  // 🔧 Gestion admin (statuts)
  // ═══════════════════════════════════════
  if (['suggestion_accepter', 'suggestion_encours', 'suggestion_refuser'].includes(interaction.customId)) {
    const member = interaction.member;
    const hasRole = member.roles.cache.has(CONFIG.ADMIN_ROLE_ID);
    const isOwner = member.id === interaction.guild.ownerId;

    if (!hasRole && !isOwner) {
      return interaction.reply({ content: '❌ Tu n\'as pas la permission de gérer les suggestions.', ephemeral: true });
    }

    const message = interaction.message;
    const embed = EmbedBuilder.from(message.embeds[0]);
    const fields = embed.data.fields;
    const statutField = fields.find(f => f.name === '📊 Statut');

    const statuts = {
      suggestion_accepter: { label: '✅ Acceptée', color: 0x00AE86 },
      suggestion_encours:  { label: '⏳ En cours', color: 0x5865F2 },
      suggestion_refuser:  { label: '❌ Refusée',  color: 0xFF4444 },
    };

    const { label, color } = statuts[interaction.customId];
    statutField.value = `**${label}**`;
    embed.setColor(color);

    await message.edit({ embeds: [embed], components: message.components });

    return interaction.reply({
      content: `✅ Suggestion marquée comme **${label}** !`,
      ephemeral: true,
    });
  }
}