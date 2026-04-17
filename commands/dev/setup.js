import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

// ─── Images (remplace les URLs par les tiennes) ───────────────────────────────
const IMAGES = {
  reglement: {
    banner:    'https://cdn.discordapp.com/attachments/1434579803649867932/1482793578139881582/image.png?ex=69b83ea2&is=69b6ed22&hm=15dbff0c7ad29e45656a8b0afd564214d2aa836cf777d0f0ecd2e36ae285985b&',
    thumbnail: 'https://media.discordapp.net/attachments/1434579803649867932/1482548861363949579/file_00000000e2a871f482b12f15b9bf7540.png?ex=69b75ab8&is=69b60938&hm=705f3f6cbe45646ed9679c88b5f921685e93f2758e64634f165227a7ba44b040&=&format=webp&quality=lossless&width=960&height=960',
  },
  guide: {
    banner:    'https://media.discordapp.net/attachments/1398459552986431519/1482780583972311060/ChatGPT_Image_15_mars_2026_17_39_51.png?ex=69b83287&is=69b6e107&hm=79d10e7815cc1fafb166b31f137dc497d4f05a5a0eb6f3a39d507bceb48d0d11&=&format=webp&quality=lossless&width=525&height=350',
    thumbnail: 'https://media.discordapp.net/attachments/1434579803649867932/1482548861363949579/file_00000000e2a871f482b12f15b9bf7540.png?ex=69b75ab8&is=69b60938&hm=705f3f6cbe45646ed9679c88b5f921685e93f2758e64634f165227a7ba44b040&=&format=webp&quality=lossless&width=960&height=960',
  },
  infos: {
    banner:    'https://cdn.discordapp.com/attachments/1434579803649867932/1482793578139881582/image.png?ex=69b83ea2&is=69b6ed22&hm=15dbff0c7ad29e45656a8b0afd564214d2aa836cf777d0f0ecd2e36ae285985b&',
    thumbnail: 'https://media.discordapp.net/attachments/1434579803649867932/1482548861363949579/file_00000000e2a871f482b12f15b9bf7540.png?ex=69b75ab8&is=69b60938&hm=705f3f6cbe45646ed9679c88b5f921685e93f2758e64634f165227a7ba44b040&=&format=webp&quality=lossless&width=960&height=960',
  },
  confirm: {
    thumbnail: 'https://i.imgur.com/REMPLACE_CONFIRM_THUMB.png',
  },
};

// ─── Configuration des panneaux ───────────────────────────────────────────────
const PANELS = {
  reglement: {
    title:       '╔═  📜 Règlement du serveur  ═╗',
    color:       0x00B894,
    description: [
      '> Bienvenue sur le serveur !',
      '> Merci de lire attentivement les règles ci-dessous.',
      '> Leur respect est **obligatoire** pour tous les membres.',
    ].join('\n'),
    footer: '⚖️ Le non-respect des règles peut entraîner des sanctions définitives.',
    fields: [
      {
        name:   '‎',  // séparateur invisible
        value:  '**─────────── Règles générales ───────────**',
        inline: false,
      },
      {
        name:   '1️⃣  Respect mutuel',
        value:  '> Respectez **tous** les membres sans exception.\n> Aucune insulte, discrimination ou harcèlement ne sera toléré.',
        inline: false,
      },
      {
        name:   '2️⃣  Spam & flood',
        value:  '> Le spam, flood et abus de mentions sont **strictement interdits**.\n> Cela inclut les copier-coller répétitifs et les majuscules excessives.',
        inline: false,
      },
      {
        name:   '3️⃣  Publicité',
        value:  '> Toute publicité (serveurs, liens, réseaux) est **interdite** sans accord préalable du staff.\n> Les contrevenants seront bannis sans avertissement.',
        inline: false,
      },
      {
        name:   '‎',
        value:  '**───────────── Contenu ─────────────**',
        inline: false,
      },
      {
        name:   '4️⃣  Contenu inapproprié',
        value:  '> Tout contenu **NSFW**, choquant ou illégal est formellement interdit.\n> Cela s\'applique aux messages, images, vidéos et pseudos.',
        inline: false,
      },
      {
        name:   '5️⃣  Décisions du staff',
        value:  '> Les décisions du staff sont **définitives et sans appel**.\n> Respectez-les. Tout contournement de sanction entraîne un ban permanent.',
        inline: false,
      },
      {
        name:   '‎',
        value:  '**─────────────────────────────────────**\n✅ En restant sur ce serveur, vous acceptez ce règlement.',
        inline: false,
      },
    ],
  },

  guide: {
    title:       '╔═  📚 Guide du serveur  ═╗',
    color:       0x00B894,
    description: [
      '> Nouveau ici ? Ce guide est fait pour toi.',
      '> Découvre comment profiter de **toutes les fonctionnalités** du serveur.',
    ].join('\n'),
    footer: '💡 N\'hésite pas à contacter le staff si tu as la moindre question.',
    fields: [
      {
        name:   '‎',
        value:  '**──────────── Navigation ────────────**',
        inline: false,
      },
      {
        name:   '💬  Discussion',
        value:  '> Utilise les **salons adaptés** à chaque sujet.\n> Consulte la liste des salons pour savoir où poster.',
        inline: true,
      },
      {
        name:   '🎫  Support',
        value:  '> Un problème ? Ouvre un **ticket** dans le salon dédié.\n> Le staff te répondra dans les plus brefs délais.',
        inline: true,
      },
      {
        name:   '‎',
        value:  '**──────────── Communauté ────────────**',
        inline: false,
      },
      {
        name:   '🎮  Activités & Événements',
        value:  '> Des **événements réguliers** sont organisés sur le serveur.\n> Suis les annonces pour ne rien rater.',
        inline: true,
      },
      {
        name:   '🏆  Niveaux & Rôles',
        value:  '> Sois actif pour **gagner des niveaux** et débloquer des rôles exclusifs.\n> Plus tu participes, plus tu progresses.',
        inline: true,
      },
      {
        name:   '‎',
        value:  '**────────────────────────────────────**',
        inline: false,
      },
      {
        name:   '⚠️  Signalement',
        value:  '> Repère un comportement suspect ? **Signale-le** au staff immédiatement.\n> Ne répondez pas aux provocations, signalez uniquement.',
        inline: false,
      },
    ],
  },

  infos: {
    title:       '╔═  ℹ️ Informations du serveur  ═╗',
    color:       0x00B894,
    description: [
      '> Tout ce que tu dois savoir sur notre communauté.',
      '> Merci d\'en faire partie ! 🎉',
    ].join('\n'),
    footer: '💛 Merci de faire partie de l\'aventure !',
    fields: [
      {
        name:   '‎',
        value:  '**──────────── Le serveur ────────────**',
        inline: false,
      },
      {
        name:   '📅  Création',
        value:  '> Serveur fondé pour rassembler une **communauté passionnée**.\n> Une aventure qui grandit chaque jour.',
        inline: true,
      },
      {
        name:   '🎯  Objectif',
        value:  '> **Partager, discuter et s\'amuser** ensemble dans une ambiance saine.\n> Un endroit où chacun a sa place.',
        inline: true,
      },
      {
        name:   '‎',
        value:  '**──────────── L\'équipe ─────────────**',
        inline: false,
      },
      {
        name:   '👥  Membres',
        value:  '> Une communauté **active, bienveillante et conviviale**.\n> Toujours prête à accueillir de nouveaux venus.',
        inline: true,
      },
      {
        name:   '🛠️  Staff',
        value:  '> Une équipe **disponible et à l\'écoute** pour vous aider.\n> N\'hésitez pas à nous contacter à tout moment.',
        inline: true,
      },
      {
        name:   '‎',
        value:  '**────────────────────────────────────**\n🌟 Bonne aventure parmi nous !',
        inline: false,
      },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildEmbed(key) {
  const panel  = PANELS[key];
  const images = IMAGES[key];

  return new EmbedBuilder()
    .setTitle(panel.title)
    .setColor(panel.color)
    .setDescription(panel.description)
    .setImage(images.banner)
    .setThumbnail(images.thumbnail)
    .addFields(panel.fields)
    .setFooter({ text: panel.footer })
    .setTimestamp();
}

function buildConfirmEmbed(type, channel, executor) {
  const isAll = type === 'all';

  const sentList = isAll
    ? Object.keys(PANELS).map(k => `> ✅  \`${k}\``).join('\n')
    : `> ✅  \`${type}\``;

  return new EmbedBuilder()
    .setTitle('🛠️  Setup effectué avec succès')
    .setColor(0x2ECC71)
    .setThumbnail(IMAGES.confirm.thumbnail)
    .setDescription('> Les panneaux ont été envoyés avec succès.\n> Retrouvez le récapitulatif ci-dessous.')
    .addFields(
      {
        name:   '‎',
        value:  '**──────── Récapitulatif ────────**',
        inline: false,
      },
      { name: '📦  Panneaux envoyés', value: sentList,                                                 inline: true  },
      { name: '📁  Salon cible',      value: `> <#${channel.id}>`,                                    inline: true  },
      { name: '‎',                    value: '**────────────────────────────────**',                   inline: false },
      { name: '👤  Exécuté par',      value: `> <@${executor.id}>`,                                   inline: true  },
      { name: '📅  Date',             value: `> <t:${Math.floor(Date.now() / 1000)}:F>`,              inline: true  },
      { name: '‎',                    value: '**────────────────────────────────**\n> 🔒 Log interne — ne pas partager.', inline: false },
    )
    .setFooter({ text: 'Système de setup — Log de confirmation' })
    .setTimestamp();
}

const VALID_TYPES = [...Object.keys(PANELS), 'all']
  .map(k => `\`+setup ${k}\``)
  .join(', ');

// ─── Cooldown anti-spam (userId → timestamp dernière utilisation) ─────────────
const cooldowns = new Map();
const COOLDOWN_MS = 10_000;

// ─── ID du salon de log de confirmation ──────────────────────────────────────
const LOG_CHANNEL_ID = '1482796030482190548';

// ─── Commande ─────────────────────────────────────────────────────────────────
export default {
  name: 'setup',
  description: 'Envoie les panneaux du serveur dans le salon courant',
  usage: `+setup <type|all> — Types disponibles : ${VALID_TYPES}`,

  async execute(message, args) {

    // ── 1. Permission ManageGuild ────────────────────────────────────────────
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ Vous n\'avez pas la permission d\'utiliser cette commande.');
    }

    // ── 2. Cooldown anti-spam ────────────────────────────────────────────────
    const now       = Date.now();
    const lastUsed  = cooldowns.get(message.author.id) ?? 0;
    const remaining = COOLDOWN_MS - (now - lastUsed);

    if (remaining > 0) {
      const seconds = (remaining / 1000).toFixed(1);
      return message.reply(`⏳ Commande en cooldown. Réessayez dans **${seconds}s**.`);
    }

    cooldowns.set(message.author.id, now);

    // ── 3. Validation de l'argument ──────────────────────────────────────────
    const type    = args[0]?.toLowerCase();
    const isAll   = type === 'all';
    const isKnown = isAll || Boolean(PANELS[type]);

    if (!type) {
      return message.reply(`❌ Argument manquant.\n📌 Utilisation : ${VALID_TYPES}`);
    }

    if (!isKnown) {
      return message.reply(`❌ Panneau inconnu : \`${type}\`\n📌 Disponibles : ${VALID_TYPES}`);
    }

    // ── 4. Envoi des embeds ──────────────────────────────────────────────────
    try {
      const keys = isAll ? Object.keys(PANELS) : [type];
      for (const key of keys) {
        await message.channel.send({ embeds: [buildEmbed(key)] });
      }
    } catch (error) {
      console.error(`[setup] Erreur envoi panneau "${type}" :`, error);
      return message.reply('❌ Une erreur est survenue lors de l\'envoi du panneau.').catch(() => null);
    }

    // ── 5. Suppression du message de commande ────────────────────────────────
    await message.delete().catch(err => {
      if (err.code !== 10008) console.warn('[setup] Impossible de supprimer le message :', err);
    });

    // ── 6. Log de confirmation dans le salon dédié ───────────────────────────
    const logChannel = message.client.channels.cache.get(LOG_CHANNEL_ID)
                    ?? await message.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);

    if (logChannel) {
      await logChannel.send({
        embeds: [buildConfirmEmbed(type, message.channel, message.author)],
      }).catch(() => null);
    }
  },
};