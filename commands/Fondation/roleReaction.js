import { EmbedBuilder } from 'discord.js';

// ============================================
// ⚙️ CONFIG — Modifie uniquement cette partie
// ============================================
const CONFIG = {
  ROLES_CHANNEL_ID: '1489722737860673770', // 👈 ID du salon des rôles

  ROLES: {
    '👨': '1489722639361642768', // 👈 ID du rôle Homme
    '👩': '1489722640653484306', // 👈 ID du rôle Femme
  },
};
// ============================================

let roleMessageId = null;

export const roleMenuSetup = {
  name: 'ready',
  once: true,

  async execute(client) {
    const channel = client.channels.cache.get(CONFIG.ROLES_CHANNEL_ID);

    if (!channel) {
      console.error(`[Roles] ❌ Salon introuvable (ID: ${CONFIG.ROLES_CHANNEL_ID})`);
      return;
    }

    const messages = await channel.messages.fetch({ limit: 10 });
    const oldMsg = messages.find(m => m.author.id === client.user.id);
    if (oldMsg) await oldMsg.delete();

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('🎭 Choix du genre')
      .setDescription('Réagis avec l\'emoji correspondant pour obtenir ton rôle !\nRéagis à nouveau pour le retirer.')
      .addFields(
        { name: '👨 Homme', value: `<@&${CONFIG.ROLES['👨']}>`, inline: true },
        { name: '👩 Femme', value: `<@&${CONFIG.ROLES['👩']}>`, inline: true },
      )
      .setFooter({ text: 'Clique sur un emoji ci-dessous ↓' })
      .setTimestamp();

    const msg = await channel.send({ embeds: [embed] });
    roleMessageId = msg.id;

    for (const emoji of Object.keys(CONFIG.ROLES)) {
      await msg.react(emoji);
    }

    console.log('[Roles] ✅ Message de rôles envoyé');
  }
};

export const roleAdd = {
  name: 'messageReactionAdd',

  async execute(reaction, user) {
    if (user.bot) return;
    if (reaction.message.id !== roleMessageId) return;

    const roleId = CONFIG.ROLES[reaction.emoji.name];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);

    try {
      await member.roles.add(roleId);
      console.log(`[Roles] ✅ Rôle ${reaction.emoji.name} ajouté à ${user.tag}`);
    } catch (err) {
      console.error(`[Roles] ❌ Impossible d'ajouter le rôle :`, err);
    }
  }
};

export const roleRemove = {
  name: 'messageReactionRemove',

  async execute(reaction, user) {
    if (user.bot) return;
    if (reaction.message.id !== roleMessageId) return;

    const roleId = CONFIG.ROLES[reaction.emoji.name];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);

    try {
      await member.roles.remove(roleId);
      console.log(`[Roles] ✅ Rôle ${reaction.emoji.name} retiré à ${user.tag}`);
    } catch (err) {
      console.error(`[Roles] ❌ Impossible de retirer le rôle :`, err);
    }
  }
};