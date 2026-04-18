import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  name: 'rps',
  description: 'Joue à Pierre-Feuille-Ciseaux contre le bot',
  aliases: ['pfc', 'shifumi'],
  async execute(message, args, client) {
    const choices = ['pierre', 'feuille', 'ciseaux'];
    const emojis = { pierre: '🪨', feuille: '📄', ciseaux: '✂️' };
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎮 Pierre - Feuille - Ciseaux')
      .setDescription('Choisis ton coup !')
      .setFooter({ text: `${message.author.tag}` });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rps_pierre')
          .setLabel('Pierre')
          .setEmoji('🪨')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rps_feuille')
          .setLabel('Feuille')
          .setEmoji('📄')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('rps_ciseaux')
          .setLabel('Ciseaux')
          .setEmoji('✂️')
          .setStyle(ButtonStyle.Danger)
      );
    
    const msg = await message.reply({ embeds: [embed], components: [row] });
    
    const collector = msg.createMessageComponentCollector({ time: 30000 });
    
    collector.on('collect', async i => {
      if (i.user.id !== message.author.id) {
        return i.reply({ content: '❌ Ce n\'est pas ton jeu !', ephemeral: true });
      }
      
      const userChoice = i.customId.replace('rps_', '');
      const botChoice = choices[Math.floor(Math.random() * choices.length)];
      
      let result = '';
      let color = '';
      
      if (userChoice === botChoice) {
        result = '🤝 Égalité !';
        color = '#FEE75C';
      } else if (
        (userChoice === 'pierre' && botChoice === 'ciseaux') ||
        (userChoice === 'feuille' && botChoice === 'pierre') ||
        (userChoice === 'ciseaux' && botChoice === 'feuille')
      ) {
        result = '🎉 Tu as gagné !';
        color = '#57F287';
      } else {
        result = '😢 Tu as perdu !';
        color = '#ED4245';
      }
      
      const resultEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle('🎮 Résultat')
        .addFields(
          { name: '👤 Ton choix', value: `${emojis[userChoice]} ${userChoice}`, inline: true },
          { name: '🤖 Mon choix', value: `${emojis[botChoice]} ${botChoice}`, inline: true },
          { name: '\u200b', value: `**${result}**`, inline: false }
        )
        .setFooter({ text: `${message.author.tag}` })
        .setTimestamp();
      
      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });
    
    collector.on('end', collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('⏰ Temps écoulé')
          .setDescription('Tu n\'as pas joué à temps !');
        msg.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
};

// Piere feuille ciseaux +rps 