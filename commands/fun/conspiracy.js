import { EmbedBuilder } from 'discord.js';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export default {
  name: 'conspiracy',
  description: 'Génère une théorie du complot aléatoire',
  usage: '',
  category: 'fun',

  execute(message, args, client) {
    try {
      const subject = pick([
        'Les pigeons', 'IKEA', 'Les ronds-points', 'Les barres de chargement',
        'Les gens qui marchent lentement', 'Les yaourts au citron', 'Les nuages',
        'Les escalators', 'Les gens qui appuient 10 fois sur "fermer" dans l\'ascenseur',
      ]);
      const action = pick([
        'sont contrôlés par', 'ont été créés par',
        'travaillent secrètement pour', 'collectent vos données pour',
        'transmettent des signaux à',
      ]);
      const actor = pick([
        'les Illuminati', 'une IA sentiente qui teste l\'humanité',
        'une confrérie de comptables suisses', 'des lézards interdimensionnels',
        'l\'Union Européenne du Vide', 'Bill Gates', 'une faction secrète de la FIFA',
      ]);
      const goal = pick([
        'pour nous rendre dépendants du sucre',
        'pour surveiller nos habitudes de sommeil',
        'pour empêcher les gens de penser le dimanche',
        'dans le cadre d\'un plan mis en place en 1987',
        'mais le grand public n\'est pas prêt pour la vérité',
        'selon des documents trouvés sur un forum en 2009',
      ]);

      const embed = new EmbedBuilder()
        .setColor('Purple')
        .setTitle('🔍 Théorie du Complot Révélée')
        .setDescription(`> 📡 *"${subject} ${action} ${actor} ${goal}."*`)
        .addFields({
          name: '⚠️ Sources',
          value: 'Un type sur Reddit + mon intuition + un PDF de 347 pages que personne n\'a lu',
          inline: false,
        })
        .setFooter({ text: '🤫 100% inventé • Partage si tu veux éveiller les masses', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur conspiracy :', error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};