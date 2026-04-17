import { EmbedBuilder } from 'discord.js';

// Map globale (à mettre en haut du fichier si ce n’est pas déjà fait)
const roleBackups = new Map();

export default {
  name: 'saveroles',
  description: 'Sauvegarde les rôles d’un membre',

  async execute(message, args) {

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member) {
      return message.reply('❌ Membre introuvable.');
    }

    // Récupération des rôles (sans @everyone)
    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .map(role => role.id);

    if (roles.length === 0) {
      return message.reply('❌ Ce membre n’a aucun rôle à sauvegarder.');
    }

    // Initialisation du stockage
    if (!roleBackups.has(message.guild.id)) {
      roleBackups.set(message.guild.id, new Map());
    }

    const guildBackups = roleBackups.get(message.guild.id);

    guildBackups.set(member.id, {
      userId: member.id,
      username: member.user.tag,
      roles,
      savedAt: Date.now(),
      savedBy: message.author.id
    });

    const rolesList = roles.map(id => `<@&${id}>`).join(', ');

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Rôles sauvegardés')
      .setDescription(`Les rôles de ${member} ont été sauvegardés avec succès.`)
      .addFields(
        { name: '👤 Membre', value: member.user.tag, inline: true },
        { name: '🎭 Nombre de rôles', value: `${roles.length}`, inline: true },
        {
          name: '📝 Rôles',
          value: rolesList.length > 1024
            ? `${roles.length} rôles sauvegardés`
            : rolesList
        }
      )
      .setFooter({ text: `Par ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },

  // =========================
  // Fonctions utilitaires
  // =========================

  getRoleBackup(guildId, userId) {
    const guildBackups = roleBackups.get(guildId);
    return guildBackups ? guildBackups.get(userId) : null;
  },

  getAllBackups(guildId) {
    return roleBackups.get(guildId) || new Map();
  }
};
