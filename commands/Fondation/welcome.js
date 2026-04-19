import { EmbedBuilder } from 'discord.js';

export const welcomeEvent = {
  name: 'guildMemberAdd',

  async execute(member) {
    const channel = member.guild.channels.cache.get('1489722724413603841');

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('👋 Bienvenue !')
      .setDescription(`Bienvenue ${member} sur **${member.guild.name}** !`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '📜 Règles', value: 'Lis le règlement' },
        { name: '🎉 Fun', value: 'Amuse-toi bien !' }
      )
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};