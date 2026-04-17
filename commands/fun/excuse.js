import { EmbedBuilder } from 'discord.js';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export default {
  name: 'excuse',
  description: 'Génère une excuse bidon pour tout',
  usage: '',
  category: 'fun',

  execute(message, args, client) {
    try {
      const debut = pick(['Je ne pouvais pas', 'J\'allais le faire mais', 'C\'est pas ma faute si', 'Écoute j\'avais prévu mais', 'Crois-moi je voulais mais']);
      const cause = pick([
        'mon chat a mangé mon chargeur',
        'la lune était en Capricorne',
        'j\'avais une urgence existentielle',
        'Netflix m\'a envoyé une notification critique',
        'j\'attendais un signe de l\'univers',
        'mon WiFi a fait grève',
        'mon horoscope me le déconseillait',
        'j\'étais en pleine crise de créativité',
        'j\'avais trop bien mangé pour bouger',
        'le temps était trop parfait pour sortir',
      ]);
      const fin = pick([
        'tu comprends ?',
        'c\'est logique non ?',
        'ça peut arriver.',
        'vraiment désolé(e).',
        'le destin en a décidé ainsi.',
        'je promets que ça recommencera pas (probablement).',
      ]);

      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('😅 Excuse Générée')
        .setDescription(`> *"${debut} ${cause}, ${fin}"*`)
        .setFooter({ text: '✨ Excuse Premium • Qualité garantie douteuse', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur excuse :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};