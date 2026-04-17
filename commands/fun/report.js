import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default {
  name: 'report',
  description: 'Signaler un utilisateur rapidement',
  async execute(message, args, client) {

    const targetId = args[0];
    if (!targetId) return message.reply('❌ Veuillez fournir l’ID de l’utilisateur à signaler. Exemple: `+report 123456789012345678`');

    const target = message.guild.members.cache.get(targetId);
    if (!target) return message.reply('❌ Utilisateur introuvable avec cet ID.');

    // Demander la raison via le chat
    message.reply('✏️ Veuillez entrer la raison du report. Vous avez 60 secondes.');

    const filter = m => m.author.id === message.author.id;
    message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
      .then(async collected => {
        const reason = collected.first().content;

        const reportChannel = message.guild.channels.cache.get('1379154056416858115');
        if (!reportChannel) return message.reply('❌ Salon de report introuvable.');

        // Embed stylé
        const embed = new EmbedBuilder()
          .setTitle('🚨 Nouveau Report')
          .setColor('#FF0000')
          .addFields(
            { name: 'Utilisateur signalé', value: `${target}`, inline: true },
            { name: 'Reporté par', value: `${message.author}`, inline: true },
            { name: 'Raison', value: reason }
          )
          .setTimestamp()
          .setFooter({ text: 'Système de modération' });

        // Boutons pour les staffs
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prendre_en_charge')
            .setLabel('Prendre en charge')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('mp_auteur')
            .setLabel('MP l’auteur')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('resolu')
            .setLabel('Résolu')
            .setStyle(ButtonStyle.Success)
        );

        // Envoyer l'embed + boutons dans le salon staff
        const sentMessage = await reportChannel.send({ embeds: [embed], components: [row] });

        // Créer un thread privé temporaire pour le staff et le membre
        const thread = await sentMessage.startThread({
          name: `Report-${target.user.username}`,
          autoArchiveDuration: 60, // 1h d’inactivité
          reason: 'Discussion privée report',
        });
        await thread.members.add(message.author.id); // Ajouter la personne qui reporte
        // Ajouter ici les rôles ou membres staff si tu veux
        const staffRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'staff');
        if (staffRole) await thread.members.add(staffRole.id);

        // Confirmer à l’utilisateur
        message.reply('✅ Votre report a été envoyé au staff ! Un thread privé a été créé pour le suivi.');
      })
      .catch(() => {
        message.reply('❌ Vous n\'avez pas fourni de raison à temps.');
      });
  }
};