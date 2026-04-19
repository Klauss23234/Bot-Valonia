import { EmbedBuilder } from 'discord.js';

const COLORS = {
  PRIMARY: '#5865F2',
  SUCCESS: '#57F287',
  ERROR: '#ED4245'
};

const CATEGORY_ORDER = [
  'Fun',
  'Utilitaire',
  'Modération',
  'Staff',
  'Autres'
];

const CATEGORY_EMOJIS = {
  Fun: '🎮',
  Utilitaire: '🔧',
  Modération: '🛡️',
  Staff: '👑',
  Autres: '📦'
};

export default {
  name: 'help',
  aliases: ['h', 'aide'],
  description: "Affiche la liste des commandes ou les infos d'une commande",
  usage: '[commande]',
  category: 'Utilitaire',

  execute(message, args, client) {
    const prefix = client.config?.prefix ?? '+';
    const commands = client.commands;

    // =====================
    // HELP GLOBAL
    // =====================
    if (!args.length) {
      const categories = {};

      commands.forEach(cmd => {
        const category = cmd.category || 'Autres';
        categories[category] ??= [];
        categories[category].push(cmd.name);
      });

      const embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY)
        .setTitle('📜 Commandes du bot')
        .setDescription(`➡️ Utilise \`${prefix}help <commande>\` pour plus d'infos`)
        .setFooter({
          text: `Préfixe : ${prefix} • ${commands.size} commande${commands.size > 1 ? 's' : ''}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      CATEGORY_ORDER.forEach(category => {
        if (!categories[category]?.length) return;

        const emoji = CATEGORY_EMOJIS[category] || '📂';
        const commandList = categories[category]
          .sort()
          .map(cmd => `\`${prefix}${cmd}\``)
          .join(', ');

        embed.addFields({
          name: `${emoji} ${category}`,
          value: commandList,
          inline: false
        });
      });

      // Catégories non prévues
      Object.keys(categories).forEach(category => {
        if (CATEGORY_ORDER.includes(category)) return;

        const commandList = categories[category]
          .sort()
          .map(cmd => `\`${prefix}${cmd}\``)
          .join(', ');

        embed.addFields({
          name: `📂 ${category}`,
          value: commandList,
          inline: false
        });
      });

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // HELP COMMANDE
    // =====================
    const query = args[0].toLowerCase();
    const command =
      commands.get(query) ||
      commands.find(cmd => cmd.aliases?.includes(query));

    if (!command) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setDescription(`❌ La commande \`${prefix}${query}\` n'existe pas.`)
        ]
      });
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`📖 Commande : ${prefix}${command.name}`)
      .setDescription(command.description || '*Aucune description fournie.*')
      .addFields({
        name: '📝 Utilisation',
        value: `\`${prefix}${command.name}${command.usage ? ' ' + command.usage : ''}\``,
        inline: false
      })
      .setFooter({
        text: `Demandé par ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    const additionalFields = [];

    if (command.aliases?.length) {
      additionalFields.push({
        name: '🏷️ Alias',
        value: command.aliases.map(a => `\`${prefix}${a}\``).join(', '),
        inline: true
      });
    }

    if (command.category) {
      const emoji = CATEGORY_EMOJIS[command.category] || '📂';
      additionalFields.push({
        name: '📂 Catégorie',
        value: `${emoji} ${command.category}`,
        inline: true
      });
    }

    if (additionalFields.length) {
      embed.addFields(...additionalFields);
    }

    return message.reply({ embeds: [embed] });
  }
};
