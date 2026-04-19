import { EmbedBuilder } from 'discord.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export default {
  name: 'ask',
  async execute(message, args) {
    const question = args.join(' ');
    if (!question) return message.reply('❌ Pose une question : `+ask comment ça va ?`');

    const thinking = await message.reply('🤔 Je réfléchis...');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Tu es un assistant Discord sympa et concis. Réponds en français, de manière claire et courte (max 3-4 phrases). Tu fais partie du serveur VALONIA.',
          messages: [{ role: 'user', content: question }],
        }),
      });

      const data   = await res.json();
      const answer = data.content?.[0]?.text || '❌ Pas de réponse.';

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🤖 Réponse')
        .addFields(
          { name: '❓ Question', value: `> ${question}` },
          { name: '💬 Réponse',  value: `> ${answer}`   },
        )
        .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      await thinking.edit({ content: '', embeds: [embed] });
    } catch (err) {
      console.error('[Ask]', err);
      await thinking.edit('❌ Une erreur est survenue.');
    }
  }
};