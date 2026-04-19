import { EmbedBuilder } from 'discord.js';

function infoEmbed(desc, color = "#ff7675") {
  return new EmbedBuilder().setDescription(desc).setColor(color);
}

async function getMember(message, args) {
  if (!args[0]) return message.member;
  return (
    message.mentions.members.first() ||
    await message.guild.members.fetch(args[0]).catch(() => null)
  );
}

export default {
  name: "avatar",
  description: "Affiche l'avatar d'un membre",

  async execute(message, args) {
    const member = await getMember(message, args);

    if (!member)
      return message.reply({ embeds: [infoEmbed("❌ Membre introuvable.")] });

    const user = await member.user.fetch();
    const avatarServeur = member.displayAvatarURL({ size: 4096, dynamic: true });
    const avatarGlobal  = user.displayAvatarURL({ size: 4096, dynamic: true });
    const isDifferent   = avatarServeur !== avatarGlobal;

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar de ${member.displayName}`)
      .setColor(member.displayHexColor === "#000000" ? "#5865F2" : member.displayHexColor)
      .setImage(avatarServeur)
      .setFooter({ text: `ID : ${user.id} • Amity Bot` })
      .setTimestamp();

    const formats = ["png", "jpg", "webp", ...(avatarServeur.includes(".gif") ? ["gif"] : [])];
    embed.addFields({
      name: "📥 Télécharger",
      value: formats.map(f =>
        `[\`${f.toUpperCase()}\`](${member.displayAvatarURL({ size: 4096, format: f })})`
      ).join(" • "),
    });

    if (isDifferent) {
      embed.addFields({
        name: "🌐 Avatar global (différent)",
        value: formats.map(f =>
          `[\`${f.toUpperCase()}\`](${user.displayAvatarURL({ size: 4096, format: f })})`
        ).join(" • "),
      });
    }

    return message.channel.send({ embeds: [embed] });
  },
};