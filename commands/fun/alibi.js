import { EmbedBuilder } from 'discord.js';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

export default {
  name: 'alibi',
  description: 'Le bot te génère un alibi solide',
  usage: '',
  category: 'fun',

  execute(message, args, client) {
    try {
      const lieu = pick([
        'chez ma grand-mère en Bretagne',
        'à une retraite spirituelle sans téléphone',
        'aux urgences (rien de grave)',
        'en train de sauver un chaton dans un arbre',
        'à une conférence TED sur la productivité',
        'chez le dentiste (2h minimum)',
        'dans un escape room (on était bloqués)',
        'en panne sur l\'autoroute',
      ]);
      const temoin = pick([
        'ma tante Micheline peut confirmer',
        'j\'ai le ticket de caisse',
        'il y a des caméras dans le coin',
        'j\'ai une story Instagram qui le prouve',
        'le boulanger du coin s\'en souvient',
        'j\'ai un selfie mais la qualité est pas top',
      ]);
      const detail = pick([
        'j\'avais même pas mon téléphone',
        'il pleuvait donc je suis forcément pas sorti(e)',
        'je peux reconstituer toute la journée minute par minute',
        'j\'avais commandé une pizza (reçu disponible)',
      ]);

      const solidity = ri(5, 9);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('🕵️ Alibi Certifié Premium')
        .setDescription(`> *"J'étais **${lieu}** — ${temoin}. Et en plus ${detail}."*`)
        .addFields(
          { name: '🔒 Solidité',           value: '█'.repeat(solidity) + '░'.repeat(10 - solidity) + ` ${solidity * 10}%`, inline: false },
          { name: '⚖️ Fiabilité juridique', value: `${ri(50, 90)}%`,   inline: true },
          { name: '🎯 Crédibilité',         value: `${ri(60, 95)}/100`, inline: true },
        )
        .setFooter({ text: '✅ Généré par notre service juridique fictif', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur alibi :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};