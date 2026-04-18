import { EmbedBuilder } from 'discord.js';

// =========================
// CONFIG — MODIFIE ICI
// =========================
const WELCOME_CHANNEL_ID = '1489722724413603841'; // 👈 ID du salon de bienvenue

// =========================
// EVENT
// =========================
export default {
  name: 'guildMemberAdd',
  once: false,

  async execute(member) {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const memberCount = member.guild.memberCount;
    const accountAge  = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.tag} vient de rejoindre !`, iconURL: member.user.displayAvatarURL({ size: 128 }) })
      .setTitle('👋 Bienvenue sur le serveur !')
      .setDescription([
        `Salut ${member} ! On est ravis de t'accueillir sur **${member.guild.name}** ! 🎉`,
        '',
        '> 📜 Lis les règles pour bien démarrer',
        '> 🎫 Ouvre un ticket si tu as besoin d\'aide',
        '> 🎮 Amuse-toi bien !',
      ].join('\n'))
      .setColor('#5865F2')
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '👤 Membre',      value: `${member}`,          inline: true },
        { name: '🎂 Compte créé', value: accountAge,            inline: true },
        { name: '👥 Membre n°',   value: `**${memberCount}**`, inline: true },
      )
      .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
      .setTimestamp();

    await channel.send({
      content: `🎉 Bienvenue sur **${member.guild.name}** ${member} ! Tu es notre **${memberCount}ème** membre !`,
      embeds: [embed]
    });
  }
};