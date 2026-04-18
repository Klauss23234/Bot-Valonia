import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import ticketPanel from '../commands/ticket-panel.js'; // Ton ticket-panel pour accéder à la config

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    console.log(`[INTERACTION] Button clicked: ${interaction.customId} by ${interaction.user.tag}`);

    // ==================== RÈGLEMENT ====================
    if (interaction.customId === 'accept_rules') {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Règlement accepté !')
        .setDescription(`Merci ${interaction.user} d'avoir lu et accepté le règlement.\n\nBienvenue parmi nous ! 🎉`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId === 'contact_staff') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📞 Contacter le staff')
        .setDescription(
          'Voici comment contacter le staff :\n' +
          '• Utilise le système de tickets\n' +
          '• MP un modérateur en ligne\n' +
          '• Mentionne @Staff dans un salon approprié'
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ==================== boutons suggestions  ====================

if (interaction.isButton()) {
  switch (interaction.customId) {
    case "suggestion_submit":
      // ouvrir modal
      break;
    case "suggestion_top":
      // afficher top suggestions
      break;
    case "suggestion_rules":
      // afficher règles
      break;
  }
}

    // ==================== TICKETS ====================
    const setupCmd = client.commands.get('ticket-setup');
    if (!setupCmd) {
      console.log('[INTERACTION] ticket-setup command not found');
      return;
    }

    const config = setupCmd.getConfig(interaction.guild.id);

    // ===== TYPES DE TICKETS =====
    const ticketTypes = {
      support: { emoji: '💬', name: 'Support Général', color: '#5865F2' },
      bug: { emoji: '🐛', name: 'Bug', color: '#ED4245' },
      suggestion: { emoji: '💡', name: 'Suggestion', color: '#57F287' },
      report: { emoji: '⚠️', name: 'Signalement', color: '#FEE75C' },
      other: { emoji: '❓', name: 'Autre', color: '#99AAB5' }
    };

    // ===== CRÉATION DE TICKET =====
    if (interaction.customId.startsWith('ticket_') &&
        !['ticket_close', 'ticket_confirm_close', 'ticket_cancel_close', 'ticket_claim'].includes(interaction.customId)) {

      const ticketTypeKey = interaction.customId.replace('ticket_', '');
      const type = ticketTypes[ticketTypeKey];
      if (!type) return interaction.reply({ content: '❌ Type de ticket invalide.', ephemeral: true });

      // Vérifier si l'utilisateur a déjà un ticket
      const existing = Array.from(config.activeTickets.values()).find(t => t.userId === interaction.user.id);
      if (existing) {
        return interaction.reply({ content: `⚠️ Tu as déjà un ticket ouvert : <#${existing.channelId}>`, ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      const ticketNumber = setupCmd.incrementCounter(interaction.guild.id);
      const channelName = `ticket-${ticketNumber}`;

      // Permissions
      const permissions = [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] },
        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
      ];
      if (config.staffRole) permissions.push({ id: config.staffRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] });

      // Créer le channel
      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: config.category || null,
        topic: `Ticket #${ticketNumber} | ${type.name} | Créé par ${interaction.user.tag}`,
        permissionOverwrites: permissions
      });

      // Embed du ticket
      const ticketEmbed = new EmbedBuilder()
        .setColor(type.color)
        .setTitle(`${type.emoji} Ticket #${ticketNumber} - ${type.name}`)
        .setDescription(`Bienvenue ${interaction.user} !\nDécris ta demande en détail. Notre équipe va te répondre.`)
        .addFields(
          { name: '📝 Type', value: type.name, inline: true },
          { name: '👤 Créé par', value: interaction.user.tag, inline: true },
          { name: '⏰ Créé le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: `ID: ${interaction.user.id}` })
        .setTimestamp();

      // Boutons du ticket
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('ticket_claim').setLabel('Prendre en charge').setEmoji('✋').setStyle(ButtonStyle.Primary)
        );

      await ticketChannel.send({ content: config.staffRole ? `<@&${config.staffRole}>` : '', embeds: [ticketEmbed], components: [row] });

      // Enregistrer le ticket
      config.activeTickets.set(ticketChannel.id, {
        channelId: ticketChannel.id,
        userId: interaction.user.id,
        number: ticketNumber,
        type: ticketTypeKey,
        createdAt: Date.now(),
        claimedBy: null
      });

      await interaction.editReply({ content: `✅ Ton ticket a été créé : ${ticketChannel}` });
    }

    // ===== FERMER =====
    else if (interaction.customId === 'ticket_close') {
      const ticketData = config.activeTickets.get(interaction.channel.id);
      if (!ticketData) return interaction.reply({ content: '❌ Ce salon n\'est pas un ticket valide.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('🔒 Fermer le ticket')
        .setDescription('Confirme la fermeture du ticket.')
        .setFooter({ text: 'Clique sur Confirmer pour fermer' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('ticket_confirm_close').setLabel('Confirmer').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('ticket_cancel_close').setLabel('Annuler').setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    // ===== CONFIRMER FERMETURE =====
    else if (interaction.customId === 'ticket_confirm_close') {
      const ticketData = config.activeTickets.get(interaction.channel.id);
      if (!ticketData) return interaction.reply({ content: '❌ Ticket invalide.', ephemeral: true });

      await interaction.update({ content: '🔒 Fermeture du ticket...', embeds: [], components: [] });

      const user = await client.users.fetch(ticketData.userId).catch(() => null);
      if (user) {
        const closeEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('🔒 Ticket fermé')
          .setDescription(`Ton ticket #${ticketData.number} a été fermé.`)
          .addFields(
            { name: '📝 Type', value: ticketData.type, inline: true },
            { name: '👮 Fermé par', value: interaction.user.tag, inline: true }
          )
          .setTimestamp();

        await user.send({ embeds: [closeEmbed] }).catch(() => {});
      }

      config.activeTickets.delete(interaction.channel.id);
      setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
    }

    // ===== ANNULER FERMETURE =====
    else if (interaction.customId === 'ticket_cancel_close') {
      await interaction.update({ content: '✅ Fermeture annulée.', embeds: [], components: [] });
    }

    // ===== PRENDRE EN CHARGE =====
    else if (interaction.customId === 'ticket_claim') {
      const ticketData = config.activeTickets.get(interaction.channel.id);
      if (!ticketData) return interaction.reply({ content: '❌ Ticket invalide.', ephemeral: true });
      if (ticketData.claimedBy) return interaction.reply({ content: '❌ Ce ticket est déjà pris en charge.', ephemeral: true });

      ticketData.claimedBy = interaction.user.id;

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✋ Ticket pris en charge')
        .setDescription(`${interaction.user} a pris en charge ce ticket.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};
