import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

const activeGiveaways = new Map();

export default {
  name: 'giveaway',
  description: 'Lance un giveaway',
  aliases: ['gstart', 'gcreate'],
  usage: '<durée> <gagnants> <prix>',
  args: true,
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args, client) {
    // Parser la durée
    const durationArg = args[0];
    const timeMatch = durationArg.match(/^(\d+)([smhd])$/);
    
    if (!timeMatch) {
      return message.reply('❌ Format de durée invalide. Utilise : s (secondes), m (minutes), h (heures), d (jours)\nExemple: `+giveaway 1h 2 Nitro`');
    }
    
    const timeValue = parseInt(timeMatch[1]);
    const timeUnit = timeMatch[2];
    
    const multipliers = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000
    };
    
    const duration = timeValue * multipliers[timeUnit];
    
    // Nombre de gagnants
    const winners = parseInt(args[1]);
    if (isNaN(winners) || winners < 1) {
      return message.reply('❌ Nombre de gagnants invalide (minimum 1).');
    }
    
    // Prix
    const prize = args.slice(2).join(' ');
    if (!prize) {
      return message.reply('❌ Indique le prix du giveaway !');
    }
    
    const endTime = Date.now() + duration;
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎉 GIVEAWAY 🎉')
      .setDescription(`**Prix:** ${prize}\n\n**Gagnants:** ${winners}\n**Se termine:** <t:${Math.floor(endTime / 1000)}:R>\n\n**Hébergé par:** ${message.author}`)
      .setFooter({ text: 'Clique sur 🎉 pour participer !' })
      .setTimestamp(endTime);
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_enter')
          .setLabel('Participer')
          .setEmoji('🎉')
          .setStyle(ButtonStyle.Primary)
      );
    
    await message.delete().catch(() => {});
    const giveawayMsg = await message.channel.send({ embeds: [embed], components: [row] });
    
    const giveawayData = {
      messageId: giveawayMsg.id,
      channelId: message.channel.id,
      guildId: message.guild.id,
      prize: prize,
      winners: winners,
      endTime: endTime,
      hostId: message.author.id,
      participants: new Set()
    };
    
    activeGiveaways.set(giveawayMsg.id, giveawayData);
    
    // Collector pour les participations
    const collector = giveawayMsg.createMessageComponentCollector({ time: duration });
    
    collector.on('collect', async i => {
      if (i.customId === 'giveaway_enter') {
        if (giveawayData.participants.has(i.user.id)) {
          giveawayData.participants.delete(i.user.id);
          await i.reply({ content: '❌ Tu ne participes plus au giveaway.', ephemeral: true });
        } else {
          giveawayData.participants.add(i.user.id);
          await i.reply({ content: '✅ Tu participes maintenant au giveaway !', ephemeral: true });
        }
        
        // Mettre à jour l'embed avec le nombre de participants
        const updatedEmbed = EmbedBuilder.from(embed)
          .setDescription(`**Prix:** ${prize}\n\n**Gagnants:** ${winners}\n**Se termine:** <t:${Math.floor(endTime / 1000)}:R>\n**Participants:** ${giveawayData.participants.size}\n\n**Hébergé par:** ${message.author}`);
        
        await giveawayMsg.edit({ embeds: [updatedEmbed] });
      }
    });
    
    // Fin du giveaway
    setTimeout(async () => {
      const participants = Array.from(giveawayData.participants);
      
      if (participants.length === 0) {
        const endEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('🎉 Giveaway terminé')
          .setDescription(`**Prix:** ${prize}\n\n❌ Aucun participant !`)
          .setFooter({ text: 'Giveaway annulé' })
          .setTimestamp();
        
        await giveawayMsg.edit({ embeds: [endEmbed], components: [] });
        return;
      }
      
      // Sélectionner les gagnants
      const winnersCount = Math.min(winners, participants.length);
      const selectedWinners = [];
      
      for (let i = 0; i < winnersCount; i++) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        selectedWinners.push(participants.splice(randomIndex, 1)[0]);
      }
      
      const winnerMentions = selectedWinners.map(id => `<@${id}>`).join(', ');
      
      const endEmbed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('🎉 Giveaway terminé !')
        .setDescription(`**Prix:** ${prize}\n\n**Gagnant(s):** ${winnerMentions}\n\n**Hébergé par:** <@${giveawayData.hostId}>`)
        .setFooter({ text: 'Félicitations !' })
        .setTimestamp();
      
      await giveawayMsg.edit({ embeds: [endEmbed], components: [] });
      await giveawayMsg.reply(`🎉 Félicitations ${winnerMentions} ! Tu as gagné **${prize}** !`);
      
      activeGiveaways.delete(giveawayMsg.id);
    }, duration);
  }
};