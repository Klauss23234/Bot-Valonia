import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} from '@discordjs/voice';
import ytdl from '@distube/ytdl-core';
import { search } from 'play-dl';

// ═══════════════════════════════════════════════════════════════════════════════
//  STATE  —  Une queue par serveur
// ═══════════════════════════════════════════════════════════════════════════════

/** @type {Map<string, any>} */
const queues = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(seconds) {
  if (!seconds) return '??:??';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function embedMusic(title, description, color = 0x5865F2, thumbnail = null) {
  const e = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: '🎵 Système Musique' });
  if (thumbnail) e.setThumbnail(thumbnail);
  return e;
}

function embedErr(description) {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle('❌  Erreur')
    .setDescription(`> ${description}`)
    .setTimestamp()
    .setFooter({ text: '🎵 Système Musique' });
}

function buildControls(loop = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_pause').setEmoji('⏸️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(loop ? ButtonStyle.Success : ButtonStyle.Secondary),
  );
}

// ─── Résolution track ─────────────────────────────────────────────────────────

async function resolveTrack(query, requestedBy) {
  const isUrl = ytdl.validateURL(query);

  if (isUrl) {
    const info = await ytdl.getInfo(query);
    const d    = info.videoDetails;
    return [{
      title:       d.title,
      url:         d.video_url,
      duration:    fmtDuration(parseInt(d.lengthSeconds)),
      thumbnail:   d.thumbnails.at(-1)?.url ?? null,
      requestedBy,
    }];
  }

  // Recherche textuelle via play-dl (juste pour l'URL)
  const results = await search(query, { source: { youtube: 'video' }, limit: 1 });
  if (!results.length) return null;

  const info = await ytdl.getInfo(results[0].url).catch(() => null);
  if (!info) return null;

  const d = info.videoDetails;
  return [{
    title:       d.title,
    url:         d.video_url,
    duration:    fmtDuration(parseInt(d.lengthSeconds)),
    thumbnail:   d.thumbnails.at(-1)?.url ?? null,
    requestedBy,
  }];
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

async function playNext(guildId) {
  const q = queues.get(guildId);
  if (!q) return;

  if (!q.queue.length) {
    q.current = null;
    q.textChannel?.send({
      embeds: [embedMusic('✅  File vide', '> La file d\'attente est vide.\n> Le bot reste en vocal.')],
    }).catch(() => null);
    return;
  }

  const track = q.queue.shift();
  q.current   = track;

  try {
    const stream = ytdl(track.url, {
      filter:        'audioonly',
      quality:       'highestaudio',
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream, {
      inputType:    StreamType.Arbitrary,
      inlineVolume: true,
    });
    resource.volume?.setVolume(q.volume / 100);

    q.player.play(resource);

    q.textChannel?.send({
      embeds: [
        embedMusic(
          '🎵  En cours de lecture',
          `> **[${track.title}](${track.url})**\n> ⏱️ Durée : \`${track.duration}\`\n> 👤 Demandé par : <@${track.requestedBy}>`,
          0x2ECC71,
          track.thumbnail,
        ),
      ],
      components: [buildControls(q.loop)],
    }).catch(() => null);

  } catch (err) {
    console.error('[MUSIC] Erreur lecture :', err.message);
    q.textChannel?.send({
      embeds: [embedErr(`Impossible de lire **${track.title}**.\n> Passage à la piste suivante...`)],
    }).catch(() => null);
    return playNext(guildId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMANDES
// ═══════════════════════════════════════════════════════════════════════════════

export const playCommand = {
  name: 'play',
  aliases: ['p'],
  description: 'Joue une musique depuis YouTube',
  usage: '+play <titre ou URL>',
  category: 'Musique',

  async execute(message, args) {
    const query = args.join(' ').trim();
    if (!query) return message.reply({ embeds: [embedErr('Précise un titre ou une URL.\nUsage : `+play <titre ou URL>`')] });

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply({ embeds: [embedErr('Tu dois être dans un salon vocal !')] });

    const perms = voiceChannel.permissionsFor(message.guild.members.me);
    if (!perms.has(PermissionFlagsBits.Connect) || !perms.has(PermissionFlagsBits.Speak)) {
      return message.reply({ embeds: [embedErr('Je n\'ai pas la permission de rejoindre ou parler dans ce salon.')] });
    }

    const searching = await message.reply({
      embeds: [embedMusic('🔍  Recherche...', `> Recherche de \`${query}\`...`)],
    });

    try {
      const trackInfo = await resolveTrack(query, message.author.id);

      if (!trackInfo) {
        return searching.edit({ embeds: [embedErr(`Aucun résultat pour \`${query}\``)] });
      }

      let q = queues.get(message.guild.id);

      if (!q) {
        const connection = joinVoiceChannel({
          channelId:      voiceChannel.id,
          guildId:        message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        q = {
          connection,
          player,
          queue:       [],
          current:     null,
          volume:      80,
          loop:        false,
          textChannel: message.channel,
        };

        queues.set(message.guild.id, q);

        player.on(AudioPlayerStatus.Idle, () => {
          if (q.loop && q.current) q.queue.unshift(q.current);
          playNext(message.guild.id);
        });

        player.on('error', err => {
          console.error('[MUSIC PLAYER ERROR]', err.message);
          playNext(message.guild.id);
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
              entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch {
            connection.destroy();
            queues.delete(message.guild.id);
          }
        });
      }

      q.queue.push(...trackInfo);

      await searching.edit({
        embeds: [
          embedMusic(
            q.current ? '➕  Ajouté à la file' : '🎵  Lecture',
            `> **[${trackInfo[0].title}](${trackInfo[0].url})**\n> ⏱️ Durée : \`${trackInfo[0].duration}\`\n> 📋 Position : \`#${q.queue.length}\``,
            0x3498DB,
            trackInfo[0].thumbnail,
          ),
        ],
      });

      if (!q.current) playNext(message.guild.id);

    } catch (err) {
      console.error('[MUSIC PLAY ERROR]', err);
      searching.edit({ embeds: [embedErr('Une erreur est survenue lors de la recherche.')] }).catch(() => null);
    }
  },
};

export const skipCommand = {
  name: 'skip', aliases: ['s', 'next'], description: 'Passe à la piste suivante', category: 'Musique',
  async execute(message) {
    const q = queues.get(message.guild.id);
    if (!q?.current) return message.reply({ embeds: [embedErr('Aucune musique en cours.')] });
    if (!message.member.voice.channel) return message.reply({ embeds: [embedErr('Tu dois être en vocal.')] });
    const skipped = q.current.title;
    q.player.stop();
    return message.reply({ embeds: [embedMusic('⏭️  Piste passée', `> **${skipped}** a été passée.`, 0xF39C12)] });
  },
};

export const stopCommand = {
  name: 'stop', aliases: ['leave', 'dc'], description: 'Stoppe la musique et quitte le vocal', category: 'Musique',
  async execute(message) {
    const q = queues.get(message.guild.id);
    if (!q) return message.reply({ embeds: [embedErr('Le bot n\'est pas en vocal.')] });
    if (!message.member.voice.channel) return message.reply({ embeds: [embedErr('Tu dois être en vocal.')] });
    q.queue = []; q.current = null; q.player.stop(); q.connection.destroy(); queues.delete(message.guild.id);
    return message.reply({ embeds: [embedMusic('⏹️  Musique arrêtée', '> La file a été vidée et le bot a quitté le vocal.', 0xE74C3C)] });
  },
};

export const pauseCommand = {
  name: 'pause', description: 'Met la musique en pause / reprend', category: 'Musique',
  async execute(message) {
    const q = queues.get(message.guild.id);
    if (!q?.current) return message.reply({ embeds: [embedErr('Aucune musique en cours.')] });
    if (q.player.state.status === AudioPlayerStatus.Paused) {
      q.player.unpause();
      return message.reply({ embeds: [embedMusic('▶️  Reprise', '> La musique a repris.', 0x2ECC71)] });
    } else {
      q.player.pause();
      return message.reply({ embeds: [embedMusic('⏸️  Pause', '> La musique est en pause.\n> Utilise `+pause` pour reprendre.', 0xF39C12)] });
    }
  },
};

export const queueCommand = {
  name: 'queue', aliases: ['q', 'file'], description: 'Affiche la file d\'attente', category: 'Musique',
  async execute(message) {
    const q = queues.get(message.guild.id);
    if (!q?.current && (!q?.queue || q.queue.length === 0)) return message.reply({ embeds: [embedErr('La file d\'attente est vide.')] });
    const lines = [];
    if (q.current) lines.push(`**▶️  En cours :**\n> **[${q.current.title}](${q.current.url})** \`${q.current.duration}\` — <@${q.current.requestedBy}>`);
    if (q.queue.length) {
      lines.push('\n**📋  File d\'attente :**');
      q.queue.slice(0, 15).forEach((t, i) => lines.push(`> **${i + 1}.** [${t.title}](${t.url}) \`${t.duration}\` — <@${t.requestedBy}>`));
      if (q.queue.length > 15) lines.push(`> *... et ${q.queue.length - 15} piste(s) de plus.*`);
    } else lines.push('\n> *Aucune piste en attente.*');
    return message.reply({ embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle(`🎵  File d'attente — ${q.queue.length + (q.current ? 1 : 0)} piste(s)`).setDescription(lines.join('\n')).addFields({ name: '🔁  Boucle', value: q.loop ? '> ✅ Activée' : '> ❌ Désactivée', inline: true }, { name: '🔊  Volume', value: `> **${q.volume}%**`, inline: true }).setTimestamp().setFooter({ text: '🎵 Système Musique' })] });
  },
};

export const volumeCommand = {
  name: 'volume', aliases: ['vol'], description: 'Règle le volume (0-100)', usage: '+volume <0-100>', category: 'Musique',
  async execute(message, args) {
    const q = queues.get(message.guild.id);
    if (!q?.current) return message.reply({ embeds: [embedErr('Aucune musique en cours.')] });
    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 0 || vol > 100) return message.reply({ embeds: [embedErr('Le volume doit être entre **0** et **100**.')] });
    q.volume = vol;
    q.player.state.resource?.volume?.setVolume(vol / 100);
    const bar = '█'.repeat(Math.round(vol / 10)) + '░'.repeat(10 - Math.round(vol / 10));
    return message.reply({ embeds: [embedMusic('🔊  Volume modifié', `> \`${bar}\` **${vol}%**`, 0x3498DB)] });
  },
};

export const loopCommand = {
  name: 'loop', aliases: ['repeat'], description: 'Active/désactive la boucle', category: 'Musique',
  async execute(message) {
    const q = queues.get(message.guild.id);
    if (!q?.current) return message.reply({ embeds: [embedErr('Aucune musique en cours.')] });
    q.loop = !q.loop;
    return message.reply({ embeds: [embedMusic(q.loop ? '🔁  Boucle activée' : '➡️  Boucle désactivée', q.loop ? '> La piste actuelle sera répétée indéfiniment.' : '> La boucle est désactivée.', q.loop ? 0x2ECC71 : 0xF39C12)] });
  },
};

export const nowplayingCommand = {
  name: 'nowplaying', aliases: ['np', 'current'], description: 'Affiche la piste en cours', category: 'Musique',
  async execute(message) {
    const q = queues.get(message.guild.id);
    if (!q?.current) return message.reply({ embeds: [embedErr('Aucune musique en cours.')] });
    return message.reply({ embeds: [embedMusic('🎵  En cours de lecture', `> **[${q.current.title}](${q.current.url})**\n> ⏱️ Durée : \`${q.current.duration}\`\n> 👤 Demandé par : <@${q.current.requestedBy}>\n> 🔊 Volume : **${q.volume}%**\n> 🔁 Boucle : ${q.loop ? '✅' : '❌'}`, 0x2ECC71, q.current.thumbnail)], components: [buildControls(q.loop)] });
  },
};

export const shuffleCommand = {
  name: 'shuffle', aliases: ['mix'], description: 'Mélange la file d\'attente', category: 'Musique',
  async execute(message) {
    const q = queues.get(message.guild.id);
    if (!q?.queue.length) return message.reply({ embeds: [embedErr('La file d\'attente est vide.')] });
    for (let i = q.queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [q.queue[i], q.queue[j]] = [q.queue[j], q.queue[i]]; }
    return message.reply({ embeds: [embedMusic('🔀  File mélangée', `> **${q.queue.length}** piste(s) mélangées aléatoirement.`, 0x9B59B6)] });
  },
};

export const removeCommand = {
  name: 'remove', aliases: ['rm'], description: 'Supprime une piste de la file', usage: '+remove <numéro>', category: 'Musique',
  async execute(message, args) {
    const q = queues.get(message.guild.id);
    if (!q?.queue.length) return message.reply({ embeds: [embedErr('La file d\'attente est vide.')] });
    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= q.queue.length) return message.reply({ embeds: [embedErr(`Numéro invalide. La file contient **${q.queue.length}** piste(s).`)] });
    const removed = q.queue.splice(index, 1)[0];
    return message.reply({ embeds: [embedMusic('🗑️  Piste supprimée', `> **${removed.title}** a été retirée de la file.`, 0xE74C3C)] });
  },
};

export const lyricsCommand = {
  name: 'lyrics', aliases: ['paroles'], description: 'Affiche les paroles de la piste en cours', category: 'Musique',
  async execute(message, args) {
    const q     = queues.get(message.guild.id);
    const query = args.join(' ').trim() || q?.current?.title;
    if (!query) return message.reply({ embeds: [embedErr('Aucune musique en cours et aucun titre précisé.')] });
    const searching = await message.reply({ embeds: [embedMusic('🔍  Recherche des paroles...', `> Recherche pour \`${query}\`...`)] });
    try {
      const res  = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(query.replace(/ - /g, '/'))}`);
      const data = await res.json();
      if (!data.lyrics) return searching.edit({ embeds: [embedErr(`Aucune parole trouvée pour \`${query}\`.`)] });
      const lyrics = data.lyrics.length > 3800 ? data.lyrics.substring(0, 3800) + '\n\n*... (paroles tronquées)*' : data.lyrics;
      return searching.edit({ embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle(`📝  Paroles — ${query}`).setDescription(lyrics).setTimestamp().setFooter({ text: '🎵 Système Musique • Source : lyrics.ovh' })] });
    } catch (err) {
      console.error('[LYRICS ERROR]', err);
      return searching.edit({ embeds: [embedErr('Impossible de récupérer les paroles.')] });
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  HANDLER BOUTONS
// ═══════════════════════════════════════════════════════════════════════════════
export async function handleMusicButtons(interaction) {
  if (!interaction.customId.startsWith('music_')) return;
  const q = queues.get(interaction.guild.id);
  if (!q) return interaction.reply({ content: '❌ Aucune musique en cours.', ephemeral: true });
  if (!interaction.member.voice.channel) return interaction.reply({ content: '❌ Tu dois être en vocal.', ephemeral: true });
  await interaction.deferUpdate();
  switch (interaction.customId) {
    case 'music_pause':
      if (q.player.state.status === AudioPlayerStatus.Paused) q.player.unpause(); else q.player.pause();
      break;
    case 'music_skip':
      q.player.stop(); break;
    case 'music_stop':
      q.queue = []; q.current = null; q.player.stop(); q.connection.destroy(); queues.delete(interaction.guild.id);
      await interaction.message.edit({ components: [] }).catch(() => null); return;
    case 'music_loop':
      q.loop = !q.loop;
      await interaction.message.edit({ components: [buildControls(q.loop)] }).catch(() => null); break;
    case 'music_prev':
      if (q.current) { q.queue.unshift(q.current); q.player.stop(); } break;
  }
}

export default playCommand;