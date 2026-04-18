import { EmbedBuilder } from 'discord.js';

// =========================
// CONFIG — MODIFIE ICI
// =========================
const WELCOME_CHANNEL_ID = '1489722724413603841'; // 👈 Ton salon de bienvenue

// =========================
// EVENT guildMemberAdd
// =========================
export default {
  name: 'guildMemberAdd',
  once: false,

  async execute(member) {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const guild       = member.guild;
    const memberCount = guild.memberCount;
    const joinedAt    = `<t:${Math.floor(Date.now() / 1000)}:F>`;
    const accountAge  = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;

    // ── Embed ──
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${member.user.tag} vient de rejoindre !`,
        iconURL: member.user.displayAvatarURL({ size: 128 })
      })
      .setTitle('👋 Bienvenue sur le serveur !')
      .setDescription([
        `Salut ${member} ! On est ravis de t'accueillir sur **${guild.name}** ! 🎉`,
        '',
        '> 📜 Lis les règles pour bien démarrer',
        '> 🎫 Ouvre un ticket si tu as besoin d\'aide',
        '> 🎮 Amuse-toi bien !',
      ].join('\n'))
      .setColor('#5865F2')
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '👤 Membre',        value: `${member}`,      inline: true },
        { name: '🎂 Compte créé',   value: accountAge,        inline: true },
        { name: '👥 Membre n°',     value: `**${memberCount}**`, inline: true },
      )
      .setImage(member.user.bannerURL({ size: 1024 }) ?? null)
      .setFooter({ text: guild.name, iconURL: guild.iconURL() })
      .setTimestamp();

    // ── Message texte + embed ──
    await channel.send({
      content: `🎉 Bienvenue sur **${guild.name}** ${member} ! Tu es notre **${memberCount}ème** membre !`,
      embeds: [embed]
    });
  }
};