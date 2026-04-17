import { EmbedBuilder } from "discord.js";

const CONFIG = {
  color: "#00e1ff",
  categories: [
    {
      label: "⚙️ Direction",
      roles: [
        { id: "1489722604175757362", name: "Créateur",          emoji: "👑" },
        { id: "1489722604779602292", name: "Co-Créateur",       emoji: "👑" },
      ],
    },
    {
      label: "🏛️ Fondation",
      roles: [
        { id: "1489722607657025663", name: "Fondateur(trice)",    emoji: "🔱" },
        { id: "1489722608550285413", name: "Co-Fondateur(trice)", emoji: "🔱" },
      ],
    },
    {
      label: "🛡️ Administration",
      roles: [
        { id: "1489722611297685514", name: "Administrateur(trice)", emoji: "⚡" },
      ],
    },
    {
      label: "🔨 Modération",
      roles: [
        { id: "1489722613189185799", name: "Modérateur(trice)", emoji: "🔹" },
      ],
    },
  ],
};

function formatMembers(role, name) {
  if (role.members.size === 0) return "*Aucun membre*";
  return role.members.map((m) => `> <@${m.id}>`).join("\n");
}

export default {
  name: "effectifs",
  description: "Affiche les effectifs staff par catégorie",

  async execute(message) {
    const fields = [];
    let totalStaff = 0;

    for (const category of CONFIG.categories) {
      const categoryFields = [];

      for (const { id, name, emoji } of category.roles) {
        const role = message.guild.roles.cache.get(id);
        if (!role) continue;

        const count = role.members.size;
        totalStaff += count;

        categoryFields.push({
          name: `${emoji} ${name} · ${count} membre${count !== 1 ? "s" : ""}`,
          value: formatMembers(role, name),
          inline: false,
        });
      }

      if (categoryFields.length === 0) continue;

      fields.push(
        { name: category.label, value: "─────────────────", inline: false },
        ...categoryFields,
        { name: "\u200b", value: "\u200b", inline: false }
      );
    }

    if (fields.length === 0) {
      fields.push({
        name: "Aucun rôle trouvé",
        value: "*Les rôles staff sont introuvables sur ce serveur.*",
        inline: false,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(CONFIG.color)
      .setTitle("👑  Effectifs Staff")
      .setDescription(
        `> Voici l'ensemble des membres de l'équipe staff.\n` +
        `> **${totalStaff}** membre${totalStaff !== 1 ? "s" : ""} au total.`
      )
      .addFields(fields)
      .setFooter({ text: "Amity Bot • Effectifs Staff" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};