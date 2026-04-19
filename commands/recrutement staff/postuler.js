import { EmbedBuilder } from 'discord.js';
import { getCandidatures, saveCandidatures, addCandidature } from '../../utils/candidaturesManager.js';

export default {
  name: 'postuler',
  description: 'Soumettre une candidature pour rejoindre le staff',
  aliases: ['apply', 'candidature'],
  
  async execute(message, args, client) {
    const config = {
      candidatureChannelId: "ID_DU_SALON_CANDIDATURES", // À modifier
      voteChannelId: "ID_DU_SALON_VOTES_STAFF", // À modifier
      logsChannelId: "ID_DU_SALON_LOGS", // À modifier
      embedColor: "#5865F2"
    };

    // Vérifier qu'on est dans le bon salon
    if (message.channel.id !== config.candidatureChannelId) {
      return message.reply('❌ Cette commande ne peut être utilisée que dans le salon des candidatures !');
    }

    // Vérifier si l'utilisateur a déjà une candidature en cours
    const candidatures = getCandidatures();
    const existing = candidatures.find(c => c.userId === message.author.id && c.status === 'pending');
    
    if (existing) {
      return message.reply('⚠️ Tu as déjà une candidature en cours !');
    }

    // Embed d'introduction
    const introEmbed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('📋 Formulaire de Candidature Staff')
      .setDescription('Réponds aux questions suivantes pour postuler au staff.\nTu as **5 minutes** pour répondre à chaque question.')
      .setFooter({ text: 'Candidature Staff' })
      .setTimestamp();

    await message.reply({ embeds: [introEmbed] });

    // Questions du formulaire
    const questions = [
      '**1️⃣ Quel est ton âge ?**',
      '**2️⃣ As-tu une expérience en modération Discord ?** (Décris-la)',
      '**3️⃣ Pourquoi veux-tu rejoindre le staff ?**',
      '**4️⃣ Quelles sont tes disponibilités ?** (Heures et jours)',
      '**5️⃣ Comment réagirais-tu face à un conflit entre membres ?**'
    ];

    const answers = [];
    const filter = m => m.author.id === message.author.id;

    // Poser les questions une par une
    for (let i = 0; i < questions.length; i++) {
      await message.channel.send(questions[i]);

      try {
        const collected = await message.channel.awaitMessages({
          filter,
          max: 1,
          time: 300000, // 5 minutes
          errors: ['time']
        });

        answers.push(collected.first().content);
        await collected.first().react('✅');
      } catch (error) {
        return message.channel.send('⏱️ Temps écoulé ! Ta candidature a été annulée.');
      }
    }

    // Créer la candidature
    const candidature = {
      id: Date.now().toString(),
      userId: message.author.id,
      username: message.author.tag,
      timestamp: Date.now(),
      status: 'pending',
      answers: {
        age: answers[0],
        experience: answers[1],
        motivation: answers[2],
        disponibilites: answers[3],
        gestionConflit: answers[4]
      },
      votes: {
        accept: [],
        refuse: []
      }
    };

    addCandidature(candidature);

    // Embed dans le salon candidatures (public)
    const candidatureEmbed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('📝 Nouvelle Candidature Staff')
      .setDescription(`**Candidat:** <@${message.author.id}> (${message.author.tag})`)
      .addFields(
        { name: '🎂 Âge', value: answers[0], inline: true },
        { name: '📊 Statut', value: '⏳ En attente', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '💼 Expérience', value: answers[1].length > 1024 ? answers[1].substring(0, 1021) + '...' : answers[1] },
        { name: '💭 Motivation', value: answers[2].length > 1024 ? answers[2].substring(0, 1021) + '...' : answers[2] },
        { name: '⏰ Disponibilités', value: answers[3].length > 1024 ? answers[3].substring(0, 1021) + '...' : answers[3] },
        { name: '🤝 Gestion de conflit', value: answers[4].length > 1024 ? answers[4].substring(0, 1021) + '...' : answers[4] }
      )
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: `ID: ${candidature.id}` })
      .setTimestamp();

    await message.channel.send({ embeds: [candidatureEmbed] });

    // Embed dans le salon de votes (staff)
    const voteChannel = client.channels.cache.get(config.voteChannelId);
    if (voteChannel) {
      const voteEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🗳️ Nouvelle Candidature à Voter')
        .setDescription(`**Candidat:** <@${message.author.id}> (${message.author.tag})\n\n**Votez avec les réactions ci-dessous !**`)
        .addFields(
          { name: '🎂 Âge', value: answers[0], inline: true },
          { name: '⏰ Temps de vote', value: 'Défini par le fondateur', inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
          { name: '💼 Expérience', value: answers[1].length > 1024 ? answers[1].substring(0, 1021) + '...' : answers[1] },
          { name: '💭 Motivation', value: answers[2].length > 1024 ? answers[2].substring(0, 1021) + '...' : answers[2] },
          { name: '⏰ Disponibilités', value: answers[3].length > 1024 ? answers[3].substring(0, 1021) + '...' : answers[3] },
          { name: '🤝 Gestion de conflit', value: answers[4].length > 1024 ? answers[4].substring(0, 1021) + '...' : answers[4] }
        )
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: `ID: ${candidature.id} | En attente du timer` })
        .setTimestamp();

      const voteMsg = await voteChannel.send({ embeds: [voteEmbed] });
      await voteMsg.react('✅');
      await voteMsg.react('❌');

      // Sauvegarder l'ID du message de vote
      candidature.voteMessageId = voteMsg.id;
      saveCandidatures();
    }

    // Logs
    const logsChannel = client.channels.cache.get(config.logsChannelId);
    if (logsChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📝 Nouvelle Candidature')
        .setDescription(`**Candidat:** <@${message.author.id}> (${message.author.tag})\n**ID:** ${candidature.id}\n**Status:** En attente`)
        .setTimestamp();
      
      await logsChannel.send({ embeds: [logEmbed] });
    }

    message.reply('✅ Ta candidature a été envoyée avec succès ! Tu seras notifié du résultat.');
  }
};