import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'embed',
  description: 'Crée un embed personnalisé de manière interactive',
  aliases: ['createembed', 'embedbuilder'],
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args, client) {
    const embedData = {
      title: null,
      description: null,
      color: '#5865F2',
      footer: null,
      thumbnail: null,
      image: null,
      fields: []
    };
    
    const previewEmbed = () => {
      const embed = new EmbedBuilder()
        .setColor(embedData.color);
      
      if (embedData.title) embed.setTitle(embedData.title);
      if (embedData.description) embed.setDescription(embedData.description);
      if (embedData.footer) embed.setFooter({ text: embedData.footer });
      if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
      if (embedData.image) embed.setImage(embedData.image);
      if (embedData.fields.length > 0) {
        embedData.fields.forEach(field => embed.addFields(field));
      }
      
      return embed;
    };
    
    const createButtons = () => {
      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('embed_title')
            .setLabel('Titre')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('embed_description')
            .setLabel('Description')
            .setEmoji('📄')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('embed_color')
            .setLabel('Couleur')
            .setEmoji('🎨')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('embed_footer')
            .setLabel('Footer')
            .setEmoji('📌')
            .setStyle(ButtonStyle.Primary)
        );
      
      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('embed_thumbnail')
            .setLabel('Miniature')
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('embed_image')
            .setLabel('Image')
            .setEmoji('🌄')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('embed_field')
            .setLabel('Ajouter un champ')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Secondary)
        );
      
      const row3 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('embed_preview')
            .setLabel('Aperçu')
            .setEmoji('👁️')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('embed_send')
            .setLabel('Envoyer')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('embed_cancel')
            .setLabel('Annuler')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Danger)
        );
      
      return [row1, row2, row3];
    };
    
    const infoEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎨 Créateur d\'Embed')
      .setDescription('Utilise les boutons ci-dessous pour personnaliser ton embed.')
      .addFields(
        { name: '📝 Titre', value: embedData.title || '*Non défini*', inline: true },
        { name: '🎨 Couleur', value: embedData.color, inline: true },
        { name: '📄 Description', value: embedData.description || '*Non définie*', inline: false }
      );
    
    const msg = await message.reply({ embeds: [infoEmbed], components: createButtons() });
    
    const collector = msg.createMessageComponentCollector({ time: 300000 });
    
    collector.on('collect', async i => {
      if (i.user.id !== message.author.id) {
        return i.reply({ content: '❌ Seul l\'auteur peut modifier cet embed !', ephemeral: true });
      }
      
      if (i.customId === 'embed_title') {
        const modal = new ModalBuilder()
          .setCustomId('modal_title')
          .setTitle('Titre de l\'embed');
        
        const input = new TextInputBuilder()
          .setCustomId('title_input')
          .setLabel('Titre')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(256)
          .setRequired(true)
          .setPlaceholder('Entrez le titre...');
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await i.showModal(modal);
        
        const submitted = await i.awaitModalSubmit({ time: 60000, filter: m => m.user.id === i.user.id }).catch(() => null);
        if (submitted) {
          embedData.title = submitted.fields.getTextInputValue('title_input');
          await submitted.reply({ content: '✅ Titre défini !', ephemeral: true });
        }
      }
      
      else if (i.customId === 'embed_description') {
        const modal = new ModalBuilder()
          .setCustomId('modal_description')
          .setTitle('Description de l\'embed');
        
        const input = new TextInputBuilder()
          .setCustomId('desc_input')
          .setLabel('Description')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(4000)
          .setRequired(true)
          .setPlaceholder('Entrez la description...');
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await i.showModal(modal);
        
        const submitted = await i.awaitModalSubmit({ time: 120000, filter: m => m.user.id === i.user.id }).catch(() => null);
        if (submitted) {
          embedData.description = submitted.fields.getTextInputValue('desc_input');
          await submitted.reply({ content: '✅ Description définie !', ephemeral: true });
        }
      }
      
      else if (i.customId === 'embed_color') {
        const modal = new ModalBuilder()
          .setCustomId('modal_color')
          .setTitle('Couleur de l\'embed');
        
        const input = new TextInputBuilder()
          .setCustomId('color_input')
          .setLabel('Code couleur hexadécimal')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(7)
          .setRequired(true)
          .setPlaceholder('#5865F2')
          .setValue(embedData.color);
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await i.showModal(modal);
        
        const submitted = await i.awaitModalSubmit({ time: 60000, filter: m => m.user.id === i.user.id }).catch(() => null);
        if (submitted) {
          const color = submitted.fields.getTextInputValue('color_input');
          if (/^#[0-9A-F]{6}$/i.test(color)) {
            embedData.color = color;
            await submitted.reply({ content: '✅ Couleur définie !', ephemeral: true });
          } else {
            await submitted.reply({ content: '❌ Code couleur invalide ! Utilise le format #RRGGBB', ephemeral: true });
          }
        }
      }
      
      else if (i.customId === 'embed_footer') {
        const modal = new ModalBuilder()
          .setCustomId('modal_footer')
          .setTitle('Footer de l\'embed');
        
        const input = new TextInputBuilder()
          .setCustomId('footer_input')
          .setLabel('Texte du footer')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(2048)
          .setRequired(true)
          .setPlaceholder('Entrez le texte du footer...');
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await i.showModal(modal);
        
        const submitted = await i.awaitModalSubmit({ time: 60000, filter: m => m.user.id === i.user.id }).catch(() => null);
        if (submitted) {
          embedData.footer = submitted.fields.getTextInputValue('footer_input');
          await submitted.reply({ content: '✅ Footer défini !', ephemeral: true });
        }
      }
      
      else if (i.customId === 'embed_thumbnail') {
        const modal = new ModalBuilder()
          .setCustomId('modal_thumbnail')
          .setTitle('Miniature de l\'embed');
        
        const input = new TextInputBuilder()
          .setCustomId('thumb_input')
          .setLabel('URL de l\'image')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder('https://exemple.com/image.png');
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await i.showModal(modal);
        
        const submitted = await i.awaitModalSubmit({ time: 60000, filter: m => m.user.id === i.user.id }).catch(() => null);
        if (submitted) {
          embedData.thumbnail = submitted.fields.getTextInputValue('thumb_input');
          await submitted.reply({ content: '✅ Miniature définie !', ephemeral: true });
        }
      }
      
      else if (i.customId === 'embed_image') {
        const modal = new ModalBuilder()
          .setCustomId('modal_image')
          .setTitle('Image de l\'embed');
        
        const input = new TextInputBuilder()
          .setCustomId('image_input')
          .setLabel('URL de l\'image')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder('https://exemple.com/image.png');
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await i.showModal(modal);
        
        const submitted = await i.awaitModalSubmit({ time: 60000, filter: m => m.user.id === i.user.id }).catch(() => null);
        if (submitted) {
          embedData.image = submitted.fields.getTextInputValue('image_input');
          await submitted.reply({ content: '✅ Image définie !', ephemeral: true });
        }
      }
      
      else if (i.customId === 'embed_field') {
        if (embedData.fields.length >= 25) {
          return i.reply({ content: '❌ Maximum 25 champs autorisés !', ephemeral: true });
        }
        
        const modal = new ModalBuilder()
          .setCustomId('modal_field')
          .setTitle('Ajouter un champ');
        
        const nameInput = new TextInputBuilder()
          .setCustomId('field_name')
          .setLabel('Nom du champ')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(256)
          .setRequired(true);
        
        const valueInput = new TextInputBuilder()
          .setCustomId('field_value')
          .setLabel('Valeur du champ')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1024)
          .setRequired(true);
        
        modal.addComponents(
          new ActionRowBuilder().addComponents(nameInput),
          new ActionRowBuilder().addComponents(valueInput)
        );
        
        await i.showModal(modal);
        
        const submitted = await i.awaitModalSubmit({ time: 60000, filter: m => m.user.id === i.user.id }).catch(() => null);
        if (submitted) {
          embedData.fields.push({
            name: submitted.fields.getTextInputValue('field_name'),
            value: submitted.fields.getTextInputValue('field_value'),
            inline: false
          });
          await submitted.reply({ content: '✅ Champ ajouté !', ephemeral: true });
        }
      }
      
      else if (i.customId === 'embed_preview') {
        await i.reply({ embeds: [previewEmbed()], ephemeral: true });
      }
      
      else if (i.customId === 'embed_send') {
        if (!embedData.title && !embedData.description) {
          return i.reply({ content: '❌ L\'embed doit avoir au moins un titre ou une description !', ephemeral: true });
        }
        
        await message.channel.send({ embeds: [previewEmbed()] });
        await i.update({ content: '✅ Embed envoyé avec succès !', embeds: [], components: [] });
        collector.stop();
      }
      
      else if (i.customId === 'embed_cancel') {
        await i.update({ content: '❌ Création d\'embed annulée.', embeds: [], components: [] });
        collector.stop();
      }
    });
    
    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};