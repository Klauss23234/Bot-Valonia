import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';

// Ajouter au event interactionCreate existant
export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    
    const setupCmd = client.commands.get('ticket-setup');
    if (!setupCmd) return;
    
    const config = setupCmd.getConfig(interaction.guild.id);
    
    // Création de ticket
    if (interaction.customId.startsWith('ticket_')) {
      const ticketType = interaction.customId.replace('ticket_', '');
      
      // Vérifier si l'utilisateur a déjà un ticket ouvert
      const existingTicket = Array.from(config.activeTickets.values())
        .find(t => t.userId === interaction.user.id);
      
      if (existingTicket) {
        return interaction.reply({
          content: `❌ Tu as déjà un ticket ouvert : <#${existingTicket.channelId}>`,
          ephemeral: true
        });
      }
      
      await interaction.deferReply({ ephemeral: true });
      
      // Types de tickets
      const types = {
        support: { emoji: '💬', name: 'Support Général', color: '#5865F2' },
        bug: { emoji: '🐛', name: 'Bug', color: '#ED4245' },
        suggestion: { emoji: '💡', name: 'Suggestion', color: '#57F287' },
        report: { emoji: '⚠️', name: 'Signalement', color: '#FEE75C' },
        other: { emoji: '❓', name: 'Autre', color: '#99AAB5' }
      };
      
      const type = types[ticketType];
      const ticketNumber = setupCmd.incrementCounter(interaction.guild.id);
      const channelName = `ticket-${ticketNumber}`;
      
      try {
        // Permissions du ticket
        const permissions = [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks
            ]
          },
          {
            id: client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels
            ]
          }
        ];
        
        // Ajouter le rôle staff s'il existe
        if (config.staffRole) {
          permissions.push({
            id: config.staffRole,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageMessages
            ]
          });
        }
        
        // Créer le salon
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
          .setDescription(`Bienvenue ${interaction.user} !\n\nMerci d'avoir ouvert un ticket. Notre équipe va te répondre dès que possible.\n\n**En attendant, décris ta demande en détail.**`)
          .addFields(
            { name: '📝 Type', value: type.name, inline: true },
            { name: '👤 Créé par', value: `${interaction.user.tag}`, inline: true },
            { name: '⏰ Créé le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
          )
          .setFooter({ text: `ID: ${interaction.user.id}` })
          .setTimestamp();
        
        // Boutons de gestion
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_close')
              .setLabel('Fermer')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('ticket_claim')
              .setLabel('Prendre en charge')
              .setEmoji('✋')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('ticket_add')
              .setLabel('Ajouter un membre')
              .setEmoji('➕')
              .setStyle(ButtonStyle.Secondary)
          );
        
        await ticketChannel.send({
          content: config.staffRole ? `<@&${config.staffRole}>` : '',
          embeds: [ticketEmbed],
          components: [row]
        });
        
        // Sauvegarder le ticket
        config.activeTickets.set(ticketChannel.id, {
          channelId: ticketChannel.id,
          userId: interaction.user.id,
          number: ticketNumber,
          type: ticketType,
          createdAt: Date.now(),
          claimedBy: null
        });
        
        await interaction.editReply({
          content: `✅ Ton ticket a été créé : ${ticketChannel}`,
          ephemeral: true
        });
        
      } catch (error) {
        console.error('Erreur création ticket:', error);
        await interaction.editReply({
          content: '❌ Une erreur est survenue lors de la création du ticket.',
          ephemeral: true
        });
      }
    }
    
    // Fermer un ticket
    else if (interaction.customId === 'ticket_close') {
      const ticketData = config.activeTickets.get(interaction.channel.id);
      
      if (!ticketData) {
        return interaction.reply({ content: '❌ Ce salon n\'est pas un ticket valide.', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('🔒 Fermer le ticket')
        .setDescription('Es-tu sûr de vouloir fermer ce ticket ?\n\n**Cette action est irréversible !**')
        .setFooter({ text: 'Clique sur Confirmer pour fermer' });
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_confirm_close')
            .setLabel('Confirmer')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('ticket_cancel_close')
            .setLabel('Annuler')
            .setStyle(ButtonStyle.Secondary)
        );
      
      await interaction.reply({ embeds: [embed], components: [row] });
    }
    
    // Confirmer fermeture
    else if (interaction.customId === 'ticket_confirm_close') {
      const ticketData = config.activeTickets.get(interaction.channel.id);
      
      if (!ticketData) {
        return interaction.reply({ content: '❌ Ticket invalide.', ephemeral: true });
      }
      
      await interaction.update({ content: '🔒 Fermeture du ticket...', embeds: [], components: [] });
      
      // Créer une transcription
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const transcript = messages.reverse().map(m => 
        `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`
      ).join('\n');
      
      // Envoyer en MP à l'utilisateur
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
      
      // Log
      const setlogsCmd = client.commands.get('setlogs');
      if (setlogsCmd) {
        const logChannelId = setlogsCmd.getLogChannel(interaction.guild.id);
        if (logChannelId) {
          const logChannel = interaction.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('🎫 Ticket fermé')
              .addFields(
                { name: '🎫 Ticket', value: `#${ticketData.number}`, inline: true },
                { name: '👤 Créateur', value: `<@${ticketData.userId}>`, inline: true },
                { name: '👮 Fermé par', value: interaction.user.tag, inline: true }
              )
              .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
      }
      
      // Supprimer le salon
      config.activeTickets.delete(interaction.channel.id);
      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);
    }
    
    // Annuler fermeture
    else if (interaction.customId === 'ticket_cancel_close') {
      await interaction.update({ content: '✅ Fermeture annulée.', embeds: [], components: [] });
    }
    
    // Prendre en charge
    else if (interaction.customId === 'ticket_claim') {
      const ticketData = config.activeTickets.get(interaction.channel.id);
      
      if (!ticketData) {
        return interaction.reply({ content: '❌ Ticket invalide.', ephemeral: true });
      }
      
      if (ticketData.claimedBy) {
        return interaction.reply({ content: '❌ Ce ticket est déjà pris en charge.', ephemeral: true });
      }
      
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