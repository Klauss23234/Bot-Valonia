import { EmbedBuilder } from 'discord.js';
import fs from 'fs';

const INVITES_FILE = './data/invites.json';

export default {
  name: 'invites',
  description: 'Voir combien de personnes quelqu\'un a invité',
  aliases: ['invitestats'],

  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;

    if (!fs.existsSync(INVITES_FILE)) {
      return message.reply('❌ Aucune donnée d\'invitations disponible.');
    }

    const invitesData = JSON.parse(fs.readFileSync(INVITES_FILE, 'utf-8'));
    const guildId = message.guild.id;

    if (!invitesData[guildId]) {
      return message.reply('❌ Aucune donnée pour ce serveur.');
    }

    // Compter les invites de l'utilisateur
    let totalInvites = 0;
    let validInvites = 0;

    Object.values(invitesData[guildId]).forEach(invite => {
      if (invite.inviter === user.id) {
        totalInvites += invite.uses || 0;
        if (invite.members) {
          validInvites += invite.members.filter(m => {
            const member = message.guild.members.cache.get(m.userId);
            return member !== undefined;
          }).length;
        }
      }
    });

    const left = totalInvites - validInvites;

    const embed = new EmbedBuilder()
      .setTitle(`📨 Invitations de ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '✅ Invitations valides', value: `${validInvites}`, inline: true },
        { name: '📊 Total invitations', value: `${totalInvites}`, inline: true },
        { name: '❌ Membres partis', value: `${left}`, inline: true }
      )
      .setColor('#5865F2')
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};