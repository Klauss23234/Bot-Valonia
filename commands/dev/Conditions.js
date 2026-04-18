import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionsBitField,
} from 'discord.js';
import fs from 'fs';

// ════════════════════════════════════════════════════════════════
// ⚙️ CONFIG
// ════════════════════════════════════════════════════════════════
const STAFF_ROLE_ID = '1409519874056912987';

const readJSON  = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJSON = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

// ════════════════════════════════════════════════════════════════
// 📋 GRADES
// ════════════════════════════════════════════════════════════════
const GRADES = [
  {
    id: "helper",
    label: "🌱 Helper",
    color: "#55efc4",
    description: "Le **Helper** est la porte d'entrée du staff.\nIl accueille les nouveaux membres, répond aux questions et maintient une bonne ambiance sur le serveur.",
    conditions: [
      "🕐 Membre du serveur depuis au moins **2 semaines**",
      "💬 Actif régulièrement en textuel et en vocal",
      "🎂 Avoir au minimum **16 ans**",
      "🧠 Faire preuve de maturité et de sérieux",
      "📜 Aucune sanction active (mute, warn...)",
      "❤️ Avoir une vraie volonté d'aider la communauté",
    ],
    avantages: [
      "🔑 Accès au salon staff",
      "🏷️ Rôle **Helper**",
      "🤝 Pouvoir guider et aider les membres",
    ],
    candidature: "Ouvre un ticket avec la raison `Candidature Helper`",
    candidatable: true,
  },
  {
    id: "moderateur",
    label: "🔨 Modérateur",
    color: "#74b9ff",
    description: "Le **Modérateur** assure la bonne ambiance du serveur.\nIl fait respecter les règles et gère les conflits avec neutralité.",
    conditions: [
      "🕐 Membre du serveur depuis au moins **1 mois**",
      "⭐ Avoir été Helper pendant **2 semaines** minimum",
      "💬 Être très actif et disponible régulièrement",
      "🎂 Avoir au minimum **17 ans**",
      "🧠 Savoir gérer les conflits avec calme et neutralité",
      "📜 Aucune sanction active ou récente",
      "🎙️ Présent en vocal pour les sessions communautaires",
    ],
    avantages: [
      "🔑 Accès complet salon staff",
      "🏷️ Rôle **Modérateur**",
      "🔨 Permissions : Kick / Mute / Ban",
      "📋 Gestion des sanctions",
    ],
    candidature: "Ouvre un ticket avec la raison `Candidature Modérateur`",
    candidatable: true,
  },
  {
    id: "admin",
    label: "⚙️ Administrateur",
    color: "#e17055",
    description: "L'**Administrateur** gère le serveur en profondeur.\nIl travaille directement avec la direction pour faire évoluer la communauté.",
    conditions: [
      "🕐 Membre du serveur depuis au moins **3 mois**",
      "⭐ Avoir été Modérateur pendant **1 mois** minimum",
      "💬 Être extrêmement actif et impliqué",
      "🎂 Avoir au minimum **18 ans**",
      "🛠️ Connaissances en gestion Discord (bots, salons, rôles...)",
      "🤝 Être de confiance et avoir fait ses preuves",
      "📜 Aucune sanction passée ou en cours",
    ],
    avantages: [
      "🔑 Accès total salon staff",
      "🏷️ Rôle **Administrateur**",
      "⚙️ Gestion complète du serveur",
      "📌 Responsabilités majeures",
    ],
    candidature: "Le recrutement Admin se fait **uniquement sur invitation** de la direction.",
    candidatable: false,
  },
  {
    id: "fondateur",
    label: "👑 Fondateur",
    color: "#fdcb6e",
    description: "Le **Fondateur** est à l'origine du serveur.\nCe grade n'est pas accessible par candidature.",
    conditions: [
      "👑 Grade **non accessible** par candidature",
      "📌 Réservé aux créateurs et propriétaires du serveur",
    ],
    avantages: [
      "👑 Contrôle total du serveur",
      "🔓 Toutes les permissions",
    ],
    candidature: null,
    candidatable: false,
  },
];

// ════════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ════════════════════════════════════════════════════════════════
function buildGradeEmbed(grade, index) {
  return new EmbedBuilder()
    .setTitle(grade.label)
    .setColor(grade.color)
    .setDescription(grade.description)
    .addFields(
      { name: "📋 Conditions requises", value: grade.conditions.map(c => `› ${c}`).join("\n") },
      { name: "✨ Avantages",           value: grade.avantages.map(a => `› ${a}`).join("\n") },
    )
    .setFooter({ text: `Grade ${index + 1}/${GRADES.length} • ${grade.candidature ?? "Non candidatable"} • Amity Bot` })
    .setTimestamp();
}

function buildNavButtons(index) {
  const grade = GRADES[index];
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`conditions_prev_${index}`)
      .setLabel("◀ Précédent")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === 0),

    new ButtonBuilder()
      .setCustomId(`conditions_home`)
      .setLabel("🏠 Accueil")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`conditions_next_${index}`)
      .setLabel("Suivant ▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === GRADES.length - 1),

    new ButtonBuilder()
      .setCustomId(`conditions_apply_${grade.id}`)
      .setLabel("📩 Postuler")
      .setStyle(ButtonStyle.Success),
  );
  return row;
}

function buildHomeEmbed() {
  return new EmbedBuilder()
    .setTitle("🛡️ Recrutement Staff — Amity")
    .setColor("#5865F2")
    .setDescription("Tu souhaites rejoindre l'équipe ?\nClique sur un grade ci-dessous pour voir les conditions et postuler.")
    .addFields(
      {
        name: "📋 Grades disponibles",
        value: GRADES.map(g => `${g.label}${g.candidatable ? "" : " *(non candidatable)*"}`).join("\n"),
      },
      {
        name: "⚠️ Rappel",
        value: "Toute candidature non sérieuse sera ignorée. Respecte les conditions avant de postuler.",
      },
    )
    .setFooter({ text: "Amity Bot • Staff" })
    .setTimestamp();
}

function buildHomeButtons() {
  const rows = [];
  let row = new ActionRowBuilder();
  let count = 0;

  for (let i = 0; i < GRADES.length; i++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`conditions_grade_${i}`)
        .setLabel(GRADES[i].label)
        .setStyle(GRADES[i].candidatable ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
    count++;
    if (count === 4 || i === GRADES.length - 1) {
      rows.push(row);
      row = new ActionRowBuilder();
      count = 0;
    }
  }
  return rows;
}

function buildConfirmEmbed(grade) {
  return new EmbedBuilder()
    .setTitle(`📩 Candidature — ${grade.label}`)
    .setColor(grade.color)
    .setDescription([
      `Tu es sur le point de postuler pour le grade **${grade.label}**.`,
      "",
      "Un ticket va être créé et le staff sera notifié de ta candidature.",
      "",
      "⚠️ **Assure-toi de remplir toutes les conditions avant de confirmer.**",
      "",
      "Confirmes-tu ta candidature ?",
    ].join("\n"))
    .setFooter({ text: "Amity Bot • Candidatures" })
    .setTimestamp();
}

function buildConfirmButtons(gradeId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`conditions_confirm_${gradeId}`)
      .setLabel("✅ Confirmer")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`conditions_cancel`)
      .setLabel("❌ Annuler")
      .setStyle(ButtonStyle.Danger),
  );
}

async function creerTicketCandidature(interaction, grade) {
  const guild  = interaction.guild;
  const member = interaction.member;

  // Vérifie si un ticket est déjà ouvert
  if (fs.existsSync('./data/open-tickets.json')) {
    const open = readJSON('./data/open-tickets.json');
    if (open[guild.id]?.[member.id]) {
      const existing = guild.channels.cache.get(open[guild.id][member.id]);
      if (existing) {
        return interaction.update({
          embeds: [new EmbedBuilder()
            .setColor("#e17055")
            .setDescription(`❌ Tu as déjà un ticket ouvert : ${existing}\nFerme-le avant d'en ouvrir un nouveau.`)
          ],
          components: [],
        });
      }
      delete open[guild.id][member.id];
      writeJSON('./data/open-tickets.json', open);
    }
  }

  // Création du salon ticket
  const ticketChannel = await guild.channels.create({
    name: `candidature-${grade.id}-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    type: ChannelType.GuildText,
    parent: "1479006980264689764",
    topic: member.id,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
      {
        id: member.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      {
        id: STAFF_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.ManageChannels,
        ],
      },
    ],
  });

  // Sauvegarde dans open-tickets.json
  if (fs.existsSync('./data/open-tickets.json')) {
    const open = readJSON('./data/open-tickets.json');
    if (!open[guild.id]) open[guild.id] = {};
    open[guild.id][member.id] = ticketChannel.id;
    writeJSON('./data/open-tickets.json', open);
  }

  // Message d'accueil dans le ticket
  const welcomeEmbed = new EmbedBuilder()
    .setTitle(`📩 Candidature ${grade.label}`)
    .setColor(grade.color)
    .setDescription([
      `Bienvenue ${member} !`,
      "",
      `Tu postules pour le grade **${grade.label}**.`,
      "Le staff va examiner ta candidature dès que possible.",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━",
      "**Pour mettre toutes les chances de ton côté :**",
      "› Présente-toi brièvement",
      "› Explique pourquoi tu veux rejoindre le staff",
      "› Parle de ton expérience et de ta disponibilité",
      "",
      `<@&${STAFF_ROLE_ID}> — Nouvelle candidature ${grade.label} !`,
    ].join("\n"))
    .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
    .setFooter({ text: `Candidature de ${member.user.tag} • Amity Bot` })
    .setTimestamp();

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket_btn")
      .setLabel("🔒 Fermer le ticket")
      .setStyle(ButtonStyle.Danger),
  );

  await ticketChannel.send({ embeds: [welcomeEmbed], components: [closeRow] });

  // Confirmation à l'utilisateur
  return interaction.update({
    embeds: [new EmbedBuilder()
      .setColor("#00b894")
      .setDescription(`✅ Ton ticket de candidature a été créé : ${ticketChannel}\n\nLe staff va te répondre dès que possible. Bonne chance ! 🍀`)
    ],
    components: [],
  });
}

// ════════════════════════════════════════════════════════════════
// 📦 COMMANDE
// ════════════════════════════════════════════════════════════════
export default {
  name: "conditions",
  description: "Affiche les conditions pour devenir staff",

  async execute(message, args) {
    const type = args[0]?.toLowerCase();

    if (type) {
      const index = GRADES.findIndex(g => g.id === type);
      if (index === -1)
        return message.reply(`❌ Grade inconnu. Disponibles : ${GRADES.map(g => `\`${g.id}\``).join(", ")}`);

      return message.channel.send({
        embeds: [buildGradeEmbed(GRADES[index], index)],
        components: [buildNavButtons(index)],
      });
    }

    return message.channel.send({
      embeds: [buildHomeEmbed()],
      components: buildHomeButtons(),
    });
  },

  // ════════════════════════════════════════════════════════════
  // 🔘 GESTION DES BOUTONS
  // À appeler depuis interactionCreate dans index.js :
  //
  // if (interaction.isButton() && interaction.customId.startsWith('conditions_')) {
  //   await conditionsCommand.handleButton(interaction);
  // }
  // ════════════════════════════════════════════════════════════
  async handleButton(interaction) {
    const id = interaction.customId;

    // Bouton grade depuis l'accueil
    if (id.startsWith("conditions_grade_")) {
      const index = parseInt(id.split("_")[2]);
      const grade = GRADES[index];
      if (!grade) return interaction.reply({ content: "❌ Grade introuvable.", ephemeral: true });

      return interaction.update({
        embeds: [buildGradeEmbed(grade, index)],
        components: [buildNavButtons(index)],
      });
    }

    // Retour accueil
    if (id === "conditions_home") {
      return interaction.update({
        embeds: [buildHomeEmbed()],
        components: buildHomeButtons(),
      });
    }

    // Précédent
    if (id.startsWith("conditions_prev_")) {
      const index = parseInt(id.split("_")[2]) - 1;
      const grade = GRADES[index];
      if (!grade) return;
      return interaction.update({
        embeds: [buildGradeEmbed(grade, index)],
        components: [buildNavButtons(index)],
      });
    }

    // Suivant
    if (id.startsWith("conditions_next_")) {
      const index = parseInt(id.split("_")[2]) + 1;
      const grade = GRADES[index];
      if (!grade) return;
      return interaction.update({
        embeds: [buildGradeEmbed(grade, index)],
        components: [buildNavButtons(index)],
      });
    }

    // Bouton Postuler → embed de confirmation
    if (id.startsWith("conditions_apply_")) {
      const gradeId = id.split("_")[2];
      const grade   = GRADES.find(g => g.id === gradeId);
      if (!grade) return interaction.reply({ content: "❌ Grade introuvable.", ephemeral: true });

      return interaction.update({
        embeds: [buildConfirmEmbed(grade)],
        components: [buildConfirmButtons(gradeId)],
      });
    }

    // Annuler la candidature → retour à l'accueil
    if (id === "conditions_cancel") {
      return interaction.update({
        embeds: [buildHomeEmbed()],
        components: buildHomeButtons(),
      });
    }

    // Confirmer la candidature → créer le ticket
    if (id.startsWith("conditions_confirm_")) {
      const gradeId = id.split("_")[2];
      const grade   = GRADES.find(g => g.id === gradeId);
      if (!grade) return interaction.reply({ content: "❌ Grade introuvable.", ephemeral: true });

      try {
        await creerTicketCandidature(interaction, grade);
      } catch (err) {
        console.error("[CONDITIONS TICKET ERROR]", err);
        if (!interaction.replied && !interaction.deferred)
          await interaction.reply({ content: "❌ Impossible de créer le ticket. Vérifie les permissions du bot.", ephemeral: true });
      }
    }
  },
};