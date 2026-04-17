import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'rules', // obligatoire
  description: 'Affiche le règlement du serveur de manière stylée',
  aliases: ['règlement', 'reglement', 'règles'],
  permissions: [PermissionFlagsBits.Administrator],

  async execute(message, args, client) {
    if (!message.guild || !message.channel) return;

    await message.delete().catch(() => {});

    try {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📜 RÈGLEMENT DU SERVEUR')
        .setDescription(`Bienvenue sur **${message.guild.name}** !\nMerci de lire et respecter ces règles.`)
        .setThumbnail(message.guild.iconURL({ dynamic: true, size: 256 }))
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('accept_rules')
          .setLabel('✅ J\'accepte')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('contact_staff')
          .setLabel('📞 Contacter le staff')
          .setStyle(ButtonStyle.Primary)
      );

      await message.channel.send({ embeds: [embed], components: [row] });

    } catch (err) {
      console.error('Erreur lors de l\'envoi du règlement :', err);
      await message.reply({ content: '❌ Impossible d\'envoyer le règlement.', ephemeral: true });
    }
  }
};
