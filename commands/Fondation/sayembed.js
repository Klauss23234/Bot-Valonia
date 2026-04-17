import { EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
  name: 'sayembed',
  description: 'Envoyer un embed personnalisé',
  usage: '+sayembed <titre> | <description> | [couleur] | [imageURL] | [thumbnailURL]',
  category: 'Staff',
  permissions: ['ManageMessages'],

  async execute(message, args) {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Permission requise : ManageMessages");
    }

    const content = args.join(' ');
    if (!content.includes('|')) {
      return message.reply(
        "❌ Format:\n`sayembed Titre | Description | Couleur(hex) | ImageURL | ThumbnailURL`"
      );
    }

    const parts = content.split('|').map(p => p.trim());

    const title = parts[0];
    const description = parts[1];
    const color = parts[2] || '#5865F2';
    const image = parts[3];
    const thumbnail = parts[4];

    if (!title || !description) {
      return message.reply("❌ Titre et description obligatoires.");
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color.startsWith('#') ? color : `#${color}`)
      .setFooter({ text: `Envoyé par ${message.author.tag}` })
      .setTimestamp();

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    await message.channel.send({ embeds: [embed] });

    await message.delete().catch(() => {});
  }
};