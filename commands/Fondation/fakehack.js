import { EmbedBuilder } from 'discord.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[ri(0, arr.length - 1)];

function fakeIP() {
  return `${ri(1,254)}.${ri(1,254)}.${ri(1,254)}.${ri(1,254)}`;
}

function fakeHash() {
  return Array.from({ length: 32 }, () => '0123456789abcdef'[ri(0, 15)]).join('');
}

function fakeMac() {
  return Array.from({ length: 6 }, () => ri(0, 255).toString(16).padStart(2, '0')).join(':');
}

function fakeLocation() {
  const cities = ['Paris, France', 'Lyon, France', 'Marseille, France', 'Bordeaux, France', 'Toulouse, France', 'Lille, France'];
  return pick(cities);
}

function fakeProvider() {
  return pick(['Orange SA', 'Free SAS', 'SFR Group', 'Bouygues Telecom', 'OVH SAS']);
}

function fakePhone() {
  return `+33 6 ${ri(10,99)} ${ri(10,99)} ${ri(10,99)} ${ri(10,99)}`;
}

function fakePassword() {
  return pick(['azerty123', 'motdepasse1', 'iloveyou', '123456', 'password', 'qwerty2024', 'discordbot123']);
}

function fakeEmail(name) {
  const domains = ['gmail.com', 'hotmail.fr', 'outlook.com', 'yahoo.fr', 'icloud.com'];
  return `${name.toLowerCase().replace(/\s/g, '.')}${ri(1, 999)}@${pick(domains)}`;
}

function fakeSearch() {
  return pick([
    '"comment supprimer définitivement son compte discord"',
    '"est ce que les autres me trouvent bizarre"',
    '"comment savoir si on est surveillé par la police"',
    '"comment effacer son historique sans laisser de traces"',
    '"mon ex me manque que faire"',
    '"comment avoir plus d\'amis en ligne"',
    '"suis je une bonne personne test"',
    '"comment devenir riche rapidement sans travailler"',
    '"est ce que mon chat m\'aime vraiment"',
    '"comment hacker un compte discord"',
  ]);
}

function fakeFact(name) {
  return pick([
    `${name} a regardé la même vidéo ${ri(15, 60)} fois de suite à 2h du matin`,
    `${name} a relu toute sa conversation pour vérifier s'il/elle était assez cool`,
    `${name} a un dossier caché de ${ri(2, 50)}Go de memes qu'il/elle ne montre à personne`,
    `${name} a cherché son propre nom sur Google ${ri(3, 20)} fois`,
    `${name} a tapé un message puis l'a supprimé ${ri(5, 30)} fois sans l'envoyer`,
    `${name} parle tout seul(e) sous la douche depuis ${ri(1, 10)} ans`,
    `${name} a un crush secret depuis ${ri(3, 24)} mois et n'ose toujours pas le dire`,
  ]);
}

export default {
  name: 'hack',
  description: 'Faux hack animé ultra réaliste',
  async execute(message, args, client) {

    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Mentionne un utilisateur ! `+hack @user`');
    if (target.id === client.user.id) return message.reply('😐 Tu essaies de me hacker moi ? Bonne chance.');

    const ip = fakeIP();
    const ip2 = fakeIP();
    const hash = fakeHash();
    const mac = fakeMac();
    const location = fakeLocation();
    const provider = fakeProvider();
    const phone = fakePhone();
    const password = fakePassword();
    const email = fakeEmail(target.username);

    const steps = [
      `\`\`\`ansi\n\u001b[32m[>] Initialisation de l'attaque...\u001b[0m\n\`\`\``,

      `\`\`\`ansi\n\u001b[32m[>] Initialisation de l'attaque...\n[+] Cible identifiée : ${target.username}#${target.discriminator || '0000'}\n[+] ID Discord : ${target.id}\n[+] Résolution IP en cours...\u001b[0m\n\`\`\``,

      `\`\`\`ansi\n\u001b[32m[+] IP publique détectée   : ${ip}\n[+] IP locale détectée     : 192.168.${ri(1,5)}.${ri(1,254)}\n[+] Adresse MAC            : ${mac}\n[+] Fournisseur            : ${provider}\n[+] Localisation           : ${location}\u001b[0m\n\`\`\``,

      `\`\`\`ansi\n\u001b[33m[+] Scan des ports ouverts...\n[+] Port 22   (SSH)    — OUVERT ✓\n[+] Port 80   (HTTP)   — OUVERT ✓\n[+] Port 443  (HTTPS)  — OUVERT ✓\n[+] Port 3306 (MySQL)  — OUVERT ✓\n[+] Bypass firewall... OK\u001b[0m\n\`\`\``,

      `\`\`\`ansi\n\u001b[33m[+] Accès base de données Discord...\n[+] Token hash trouvé : ${hash}\n[+] Déchiffrement en cours...\n[+] ████████░░ 80%...\u001b[0m\n\`\`\``,

      `\`\`\`ansi\n\u001b[33m[+] ██████████ 100% ✓\n[+] Mot de passe récupéré  : ${password}\n[+] Email associé          : ${email}\n[+] Numéro de téléphone    : ${phone}\n[+] Scan fichiers locaux...\n[+] /Documents/secrets/    (${ri(3, 30)} fichiers)\n[+] /Photos/               (${ri(50, 800)} fichiers)\n[+] /Téléchargements/      (${ri(20, 300)} fichiers)\u001b[0m\n\`\`\``,

      `\`\`\`ansi\n\u001b[31m[!!!] ACCÈS TOTAL OBTENU\n[!!!] Données personnelles extraites\n[!!!] Caméra accessible    : OUI ⚠️\n[!!!] Micro accessible     : OUI ⚠️\n[!!!] Historique complet   : COPIÉ ✓\n[!!!] Alerte envoyée à     : fbi.gov ✓\n[!!!] ${target.username} a été totalement compromis(e)\n[!!!] ETA forces de l'ordre : ${ri(3, 15)} minutes\u001b[0m\n\`\`\``,
    ];

    const msg = await message.channel.send(steps[0]);
    for (let i = 1; i < steps.length; i++) {
      await sleep(ri(1100, 1600));
      await msg.edit(steps.slice(0, i + 1).join('\n'));
    }

    await sleep(1000);

    const embed = new EmbedBuilder()
      .setColor('#00FF41')
      .setTitle('💀 RAPPORT DE HACK — CONFIDENTIEL')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🎯 Cible',             value: `${target.username}`,   inline: true },
        { name: '🔑 Mot de passe',      value: `\`${password}\``,      inline: true },
        { name: '📧 Email',             value: `\`${email}\``,         inline: true },
        { name: '🌍 IP publique',       value: `\`${ip}\``,            inline: true },
        { name: '📍 Localisation',      value: location,               inline: true },
        { name: '📱 Téléphone',         value: `\`${phone}\``,         inline: true },
        { name: '🔎 Dernière recherche Google', value: fakeSearch(),   inline: false },
        { name: '😳 Info compromettante',       value: fakeFact(target.username), inline: false },
        { name: '⚠️ Statut',            value: '🔴 Compromis — Données en cours d\'exfiltration', inline: false },
      )
      .setFooter({ text: '⚠️ Blague — aucun vrai hack n\'a eu lieu', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ content: `${target} 👀`, embeds: [embed] });
  }
};