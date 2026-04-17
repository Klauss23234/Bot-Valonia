import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionsBitField, 
  InteractionCollector 
} from 'discord.js';

export default {
  name: 'staffhelp',
  description: 'Panel interactif staff complet',
  
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Commande réservée au staff.");
    }

    const embed = new EmbedBuilder()
      .setTitle('📘 Panel Aide Staff')
      .setDescription('Cliquez sur une catégorie ci-dessous pour voir les tutoriels.')
      .setColor('#5865F2');

    // ----------------------------
    // Boutons catégories
    // ----------------------------
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('help_tickets')
        .setLabel('🎟 Tickets')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('help_mod')
        .setLabel('🛠 Modération')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('help_logs')
        .setLabel('📊 Logs')
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('help_admin')
        .setLabel('⚙️ Admin')
        .setStyle(ButtonStyle.Danger)
    );

    const panelMessage = await message.channel.send({ embeds: [embed], components: [row1, row2] });

    // ----------------------------
    // Collecteur pour gérer les clics
    // ----------------------------
    const collector = panelMessage.createMessageComponentCollector({ time: 5 * 60 * 1000 });

    collector.on('collect', async interaction => {
      if (!interaction.isButton()) return;

      let newEmbed = new EmbedBuilder().setColor('#5865F2');

      switch(interaction.customId) {
        case 'help_tickets':
          newEmbed
            .setTitle('🎟 Guide Tickets')
            .setDescription('Exemples :\n- `+ticket create`\n- `+ticket close`\n\nMini-guides :')
            .addFields(
              { name: 'Comment créer un ticket', value: 'Cliquez sur “Créer un ticket” puis suivez les instructions.' },
              { name: 'Comment fermer un ticket', value: 'Cliquez sur le bouton “Fermer le ticket” du channel concerné.' }
            );
          break;

        case 'help_mod':
          newEmbed
            .setTitle('🛠 Guide Modération')
            .setDescription('Exemples :\n- `+mute @user`\n- `+kick @user`\n- `+warn @user`\n\nMini-guides :')
            .addFields(
              { name: 'Mute', value: 'Sélectionnez un utilisateur puis donnez la durée du mute.' },
              { name: 'Warn', value: 'Vous pouvez ajouter une raison visible pour garder un historique.' }
            );
          break;

        case 'help_logs':
          newEmbed
            .setTitle('📊 Guide Logs')
            .setDescription('Exemples :\n- Historique des actions staff\n- Connexion/déconnexion des membres\n\nMini-guides :')
            .addFields(
              { name: 'Voir les logs', value: 'Utilisez `+logs view` ou consultez le canal #logs.' },
              { name: 'Filtrer par staff', value: 'Vous pouvez filtrer par modérateur ou type d’action.' }
            );
          break;

        case 'help_admin':
          newEmbed
            .setTitle('⚙️ Guide Admin')
            .setDescription('Exemples :\n- Gestion des rôles\n- Configurations serveur\n\nMini-guides :')
            .addFields(
              { name: 'Attribuer un rôle', value: 'Utilisez `+role @user @role` pour donner un rôle.' },
              { name: 'Lock serveur', value: 'Bloquez temporairement les messages avec `+serverlock`.' }
            );
          break;
      }

try {
  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({ embeds: [newEmbed], components: [row1, row2] });
  } else {
    await interaction.update({ embeds: [newEmbed], components: [row1, row2] });
  }
} catch (err) {
  // Si l'interaction est expirée, on envoie un message classique
  await interaction.channel.send({ embeds: [newEmbed] }).catch(() => {});
}
    });

    collector.on('end', () => {
      panelMessage.edit({ components: [] }).catch(() => {});
    });
  }
};