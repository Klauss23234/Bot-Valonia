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
name: "banner",
  description: "Affiche la bannière de profil d'un membre",

  async execute(message, args) {
    const member = await getMember(message, args);

    if (!member)
      return message.reply({ embeds: [infoEmbed("❌ Membre introuvable.")] });

    const user = await member.user.fetch(); // obligatoire pour avoir la bannière
    const bannerUrl = user.bannerURL({ size: 4096, dynamic: true });

    if (!bannerUrl) {
      return message.reply({ embeds: [
        infoEmbed(
          `❌ **${member.displayName}** n'a pas de bannière de profil.\n*La bannière est une fonctionnalité réservée aux comptes Discord Nitro.*`,
          "#636e72"
        ),
      ] });
    }

    const formats = ["png", "jpg", "webp", ...(bannerUrl.includes(".gif") ? ["gif"] : [])];

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Bannière de ${member.displayName}`)
      .setColor(user.accentColor ? `#${user.accentColor.toString(16).padStart(6, "0")}` : "#5865F2")
      .setImage(bannerUrl)
      .addFields({
        name: "📥 Télécharger",
        value: formats.map(f =>
          `[\`${f.toUpperCase()}\`](${user.bannerURL({ size: 4096, format: f })})`
        ).join(" • "),
      })
      .setFooter({ text: `ID : ${user.id} • Amity Bot` })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  },
}
