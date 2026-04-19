import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default {
  name: 'staffresources',
  description: 'Panel interactif des ressources pour le staff',
  async execute(message) {
    let page = 0;

    // Données des pages
    const pages = [
      new EmbedBuilder()
        .setTitle('📜 Règles du serveur')
        .setDescription('Voici les règles principales du serveur pour le staff.\n\n• Respect des membres\n• Pas de spam\n• Utilisation correcte des salons')
        .setColor('Blue')
        .setImage('https://i.imgur.com/Regles.png')
        .setFooter({ text: 'Page 1 / 4' }),
      new EmbedBuilder()
        .setTitle('🎫 Procédure des tickets')
        .setDescription('Comment gérer les tickets correctement :\n\n1️⃣ Ouvrir un ticket\n2️⃣ Assigner le staff\n3️⃣ Clôturer le ticket proprement')
        .setColor('Green')
        .setImage('https://i.imgur.com/Tickets.png')
        .setFooter({ text: 'Page 2 / 4' }),
      new EmbedBuilder()
        .setTitle('⚙️ Commandes administratives')
        .setDescription('Exemples de commandes utiles pour le staff :\n\n`+ban @user raison`\n`+mute @user durée`\n`+warn @user raison`')
        .setColor('Orange')
        .setImage('https://i.imgur.com/Commandes.png')
        .setFooter({ text: 'Page 3 / 4' }),
      new EmbedBuilder()
        .setTitle('❓ FAQ Staff')
        .setDescription('Questions fréquentes :\n\n• Comment attribuer un rôle ?\n• Comment consulter les logs ?\n• Comment signaler un abus ?')
        .setColor('Purple')
        .setImage('https://i.imgur.com/FAQ.png')
        .setFooter({ text: 'Page 4 / 4' }),
    ];

    // Boutons de navigation
    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️ Retour')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('➡️ Suivant')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === pages.length - 1)
      );

    const msg = await message.channel.send({ embeds: [pages[page]], components: [row()] });

    // Collector pour gérer les boutons
    const filter = (i) => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'next') page++;
      if (interaction.customId === 'prev') page--;

      // Met à jour le message
      await interaction.update({ embeds: [pages[page]], components: [row()] });
    });

    collector.on('end', async () => {
      // Désactive les boutons après expiration
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Retour').setStyle(ButtonStyle.Primary).setDisabled(true),
        new ButtonBuilder().setCustomId('next').setLabel('➡️ Suivant').setStyle(ButtonStyle.Primary).setDisabled(true)
      );
      msg.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};