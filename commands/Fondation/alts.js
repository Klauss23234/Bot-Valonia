import { PermissionsBitField, EmbedBuilder } from 'discord.js';

export default {
  name: 'alts',
  description: 'Analyse les comptes suspects',
  usage: '+alts @user',
  category: 'Staff',
  permissions: ['ManageGuild'],

  async execute(message, args) {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply("❌ Permission requise : ManageGuild");
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply("❌ Mentionne un utilisateur.");
    }

    const guild = message.guild;

    const accountAgeDays = Math.floor(
      (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24)
    );

    const sameCreation = guild.members.cache.filter(m =>
      Math.abs(m.user.createdTimestamp - member.user.createdTimestamp) < 86400000 &&
      m.id !== member.id
    );

    const recentJoins = guild.members.cache.filter(m =>
      (Date.now() - m.joinedTimestamp) < 86400000
    );

    const embed = new EmbedBuilder()
      .setTitle('🕵️ Analyse ALT')
      .setColor(accountAgeDays < 7 ? '#ED4245' : '#57F287')
      .addFields(
        { name: 'Compte créé il y a', value: `${accountAgeDays} jours`, inline: true },
        { name: 'Comptes créés même jour', value: `${sameCreation.size}`, inline: true },
        { name: 'Joins récents (24h)', value: `${recentJoins.size}`, inline: true }
      )
      .setFooter({ text: `Analyse demandée par ${message.author.tag}` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};