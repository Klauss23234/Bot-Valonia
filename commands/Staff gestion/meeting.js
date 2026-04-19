import { EmbedBuilder } from 'discord.js';
import fs from 'fs';

// ════════════════════════════════════════════════════════════════
// ⚙️ CONFIG
// ════════════════════════════════════════════════════════════════
const SALON_ID = "1476082911034867860";
const ROLE_ID  = "1470129937196519575";
const FILE     = './data/meetings.json';

// ════════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ════════════════════════════════════════════════════════════════
function load() {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function infoEmbed(desc, color = "#5865F2") {
  return new EmbedBuilder().setDescription(desc).setColor(color);
}

function buildMeetingEmbed(m) {
  return new EmbedBuilder()
    .setTitle("📅 Réunion Staff")
    .setColor("#a29bfe")
    .setDescription(m.info)
    .addFields(
      { name: "👤 Organisée par", value: `<@${m.authorId}>`, inline: true },
      { name: "📅 Date de création", value: m.date,          inline: true },
      { name: "🆔 ID",              value: `\`#${m.id}\``,   inline: true },
    )
    .setFooter({ text: "Amity Bot • Réunions Staff" })
    .setTimestamp();
}

// ════════════════════════════════════════════════════════════════
// 📦 COMMANDE
// ════════════════════════════════════════════════════════════════
export default {
  name: "meeting",
  description: "Gérer les réunions staff",

  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const { channel, author, member, client, guild } = message;

    const isAdmin = member.permissions.has("Administrator");
    if (!isAdmin)
      return message.reply("❌ Tu n'as pas la permission de gérer les réunions.");

    // ── +meeting list ─────────────────────────────────────────
    if (sub === "list") {
      const meetings = load();

      if (!meetings.length)
        return message.reply({ embeds: [infoEmbed("📋 Aucune réunion enregistrée pour l'instant.")] });

      const embed = new EmbedBuilder()
        .setTitle("📋 Liste des réunions staff")
        .setColor("#a29bfe")
        .setDescription(meetings.map(m =>
          `\`#${m.id}\` — **${m.info.slice(0, 50)}${m.info.length > 50 ? "..." : ""}**\n└ ${m.date} • par <@${m.authorId}>`
        ).join("\n\n"))
        .setFooter({ text: `${meetings.length} réunion(s) • Amity Bot` })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // ── +meeting cancel <id> ──────────────────────────────────
    if (sub === "cancel") {
      const id = parseInt(args[1]);
      if (isNaN(id))
        return message.reply("❌ Usage : `+meeting cancel <id>`");

      const meetings = load();
      const index = meetings.findIndex(m => m.id === id);

      if (index === -1)
        return message.reply(`❌ Réunion \`#${id}\` introuvable.`);

      const [removed] = meetings.splice(index, 1);
      save(meetings);

      // Notif dans le salon dédié
      const salon = client.channels.cache.get(SALON_ID);
      if (salon) {
        await salon.send({ embeds: [
          new EmbedBuilder()
            .setTitle("❌ Réunion annulée")
            .setColor("#e17055")
            .setDescription(removed.info)
            .addFields(
              { name: "👤 Annulée par",    value: `<@${author.id}>`, inline: true },
              { name: "🆔 ID",             value: `\`#${removed.id}\``, inline: true },
            )
            .setFooter({ text: "Amity Bot • Réunions Staff" })
            .setTimestamp(),
        ] });
      }

      return message.reply({ embeds: [infoEmbed(`✅ Réunion **#${id}** annulée.`, "#00b894")] });
    }

    // ── +meeting <info> ───────────────────────────────────────
    const info = args.join(" ").trim();

    if (!info || info.length < 5)
      return message.reply("❌ Usage : `+meeting <description>` | `+meeting list` | `+meeting cancel <id>`");

    const meetings = load();

    const ids = meetings.map(m => parseInt(m.id)).filter(n => !isNaN(n));
    const newId = ids.length ? Math.max(...ids) + 1 : 1;

    const meeting = {
      id: newId,
      info,
      authorId: author.id,
      authorTag: author.tag,
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    };

    meetings.push(meeting);
    save(meetings);

    // Publication dans le salon dédié
    const salon = client.channels.cache.get(SALON_ID);
    if (salon) {
      await salon.send({
        content: `<@&${ROLE_ID}> 📅 **Nouvelle réunion staff !**`,
        embeds: [buildMeetingEmbed(meeting)],
      });
      return message.reply({ embeds: [infoEmbed(`✅ Réunion **#${newId}** publiée dans <#${SALON_ID}> !`, "#00b894")] });
    } else {
      return message.reply({ embeds: [infoEmbed(`✅ Réunion **#${newId}** enregistrée.\n⚠️ Salon introuvable — vérifie \`SALON_ID\`.`, "#fdcb6e")] });
    }
  },
};