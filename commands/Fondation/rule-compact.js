import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'rules-compact',
  description: 'Affiche le règlement du serveur en version compacte (1 seul embed)',
  aliases: ['règlement-compact', 'rc'],
  permissions: [PermissionFlagsBits.Administrator],

  async execute(message, args, client) {
    if (!message.guild || !message.channel) return;

    await message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📜 RÈGLEMENT DU SERVEUR')
      .setDescription(`Bienvenue sur **${message.guild.name}** ! Merci de lire et respecter ces règles pour maintenir une communauté agréable. 💙`)
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: '🤝 Respect & Comportement',
          value: '```yaml\n• Respectez tous les membres\n• Langage approprié\n• Pas d\'insultes, harcèlement ou discrimination\n• Évitez le spam```',
        },
        {
          name: '📢 Contenu & Partage',
          value: '```yaml\n• Pas de contenu NSFW, violent ou illégal\n• Publicité interdite sans autorisation\n• Protégez la vie privée\n• Respectez les droits d\'auteur```',
        },
        {
          name: '📝 Salons & Organisation',
          value: '```yaml\n• Utilisez les salons appropriés\n• Consultez les descriptions\n• Respectez les conversations vocales\n• Pas de flood ou spam```',
        },
        {
          name: '⚖️ Sanctions',
          value: '```diff\n+ 1ère fois: Avertissement\n+ 2ème fois: Mute temporaire\n+ 3ème fois: Kick\n- Infractions graves: Ban immédiat```',
          inline: true,
        },
        {
          name: '👮 Staff',
          value: '```yaml\n• Décisions finales\n• Toujours disponible\n• Système de tickets\n• Respect obligatoire```',
          inline: true,
        },
        {
          name: '\u200b',
          value: '**⚠️ En restant sur ce serveur, vous acceptez automatiquement ce règlement.**\n*L\'équipe peut modifier les règles à tout moment.*',
        }
      )
      .setImage('https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=1200&h=300&fit=crop')
      .setTimestamp()
      .setFooter({ text: `${message.guild.name} • Règlement v2.0`, iconURL: message.guild.iconURL() });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_rules')
        .setLabel('✅ J\'accepte')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('contact_staff')
        .setLabel('📞 Contacter le staff')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('📖 Guide du serveur')
        .setURL('https://discord.gg/ton-serveur') // Change ce lien
        .setStyle(ButtonStyle.Link)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
