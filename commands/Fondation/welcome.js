import { EmbedBuilder } from 'discord.js';

// ============================================
// ⚙️ CONFIG — Modifie uniquement cette partie
// ============================================
const CONFIG = {
  WELCOME_CHANNEL_ID: '1489722724413603841', // 👈 ID du salon de bienvenue
  RULES_CHANNEL_ID:   '1489722727597211688', // 👈 ID du salon règlement
  ROLES_CHANNEL_ID:   '1489722737860673770', // 👈 ID du salon des rôles
  BANNER_URL:         'https://chatgpt.com/s/m_69e4c4e00668819181cfccb04f77b47f', // 👈 URL de ta bannière
};
// ============================================

export const welcomeEvent = {
  name: 'guildMemberAdd',

  async execute(member) {
    const channel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);

    if (!channel) {
      console.error(`[Welcome] ❌ Salon introuvable (ID: ${CONFIG.WELCOME_CHANNEL_ID})`);
      return;
    }

    const { user, guild } = member;
    const accountCreated = Math.floor(user.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`👋 Bienvenue sur ${guild.name} !`)
      .setDescription(
        `Salut ${member} ! On est ravis de t'accueillir parmi nous. 🎉\n` +
        `Tu es le **${guild.memberCount}ème membre** du serveur !`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage(CONFIG.BANNER_URL ?? guild.bannerURL({ size: 1024, dynamic: true }) ?? null)
      .addFields(
        {
          name: '👤 Profil',
          value: [
            `> **Pseudo :** ${user.username}`,
            `> **ID :** \`${user.id}\``,
            `> **Compte créé :** <t:${accountCreated}:R>`,
          ].join('\n'),
          inline: false,
        },
        {
          name: '📜 Règlement',
          value: `> Commence par lire les règles dans <#${CONFIG.RULES_CHANNEL_ID}> pour pas te faire kick 😅`,
          inline: true,
        },
        {
          name: '🎭 Rôles',
          value: `> Choisis tes rôles dans <#${CONFIG.ROLES_CHANNEL_ID}> pour accéder aux salons`,
          inline: true,
        },
        {
          name: '💬 Présente-toi',
          value: `> N'hésite pas à te présenter et à discuter avec la communauté !`,
          inline: false,
        }
      )
      .setFooter({
        text: `${guild.name} • Membre #${guild.memberCount}`,
        iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    try {
      await channel.send({
        content: `> 🎊 Bienvenue <@${user.id}> !`,
        embeds: [embed],
      });
      console.log(`[Welcome] ✅ Message envoyé pour ${user.tag} (${user.id})`);
    } catch (err) {
      console.error(`[Welcome] ❌ Impossible d'envoyer le message :`, err);
    }
  }
};