import { EmbedBuilder } from 'discord.js';
import { getCandidatures, saveCandidatures, startVoteTimer } from '../../utils/candidaturesManager.js';

export default {
  name: 'startvote',
  description: 'Démarrer le vote pour une candidature (Fondateur uniquement)',
  aliases: ['demarrervote'],
  ownerOnly: true,
  
  async execute(message, args, client) {
    const config = {
      voteChannelId: "ID_DU_SALON_VOTES_STAFF", // À modifier
      candidatureChannelId: "ID_DU_SALON_CANDIDATURES", // À modifier
      logsChannelId: "ID_DU_SALON_LOGS" // À modifier
    };

    if (!args[0] || !args[1]) {
      return message.reply('❌ Usage: `+startvote <id_candidature> <durée_en_heures>`\nExemple: `+startvote 1738598765432 1`');
    }

    const candidatureId = args[0];
    const duration = parseFloat(args[1]);

    if (isNaN(duration) || duration <= 0) {
      return message.reply('❌ La durée doit être un nombre positif (en heures).');
    }

    const candidatures = getCandidatures();
    const candidature = candidatures.find(c => c.id === candidatureId && c.status === 'pending');

    if (!candidature) {
      return message.reply('❌ Candidature introuvable ou déjà traitée !');
    }

    const durationMs = duration * 3600000; // Convertir heures en millisecondes
    const endTime = Date.now() + durationMs;

    // Mettre à jour le message de vote
    const voteChannel = client.channels.cache.get(config.voteChannelId);
    if (voteChannel && candidature.voteMessageId) {
      try {
        const voteMsg = await voteChannel.messages.fetch(candidature.voteMessageId);
        const updatedEmbed = EmbedBuilder.from(voteMsg.embeds[0])
          .setColor('#FFFF00')
          .setFields(
            voteMsg.embeds[0].fields[0],
            { name: '⏰ Temps de vote', value: `${duration}h (fin: <t:${Math.floor(endTime / 1000)}:R>)`, inline: true },
            voteMsg.embeds[0].fields[2],
            voteMsg.embeds[0].fields[3],
            voteMsg.embeds[0].fields[4],
            voteMsg.embeds[0].fields[5],
            voteMsg.embeds[0].fields[6]
          )
          .setFooter({ text: `ID: ${candidature.id} | Vote en cours` });

        await voteMsg.edit({ embeds: [updatedEmbed] });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du message de vote:', error);
      }
    }

    message.reply(`✅ Vote démarré pour la candidature \`${candidatureId}\` !\n⏰ Durée: **${duration}h**\n🔔 Fin: <t:${Math.floor(endTime / 1000)}:R>`);

    // Démarrer le timer
    startVoteTimer(candidatureId, durationMs, client, config);
  }
};