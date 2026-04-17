import { PermissionFlagsBits } from 'discord.js';

export default {
  name: 'perms-manager',
  description: 'Gestion complète des permissions par rôle',
  aliases: [
    'voirtout', 'ecriretout', 'reacttout', 'parlertout', 'fulltout', 'mutetout', 'resettout',
    'voircateg', 'ecrirecateg', 'fullcateg',
    'listcateg', 'checkperm', 'cloneperm', 'setupstaff', 'setupmodo', 'setupmembre', 'setupvip',
    'lockall', 'unlockall', 'hideall', 'showall'
  ],
  permissions: [PermissionFlagsBits.Administrator],

  async execute(message, args, client) {
    const command = message.content.slice(client.config.prefix.length).trim().split(/ +/)[0].toLowerCase();

    // ===== COMMANDES GLOBALES =====

    if (command === 'voirtout') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+voirtout ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased() || c.type === 2);

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true
          });
          count++;
        } catch (error) {
          console.error(`Erreur sur ${channel.name}:`, error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** peut maintenant VOIR **${count}** salons !`);
    }

    if (command === 'ecriretout') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+ecriretout ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased());

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true,
            SendMessages: true
          });
          count++;
        } catch (error) {
          console.error(`Erreur sur ${channel.name}:`, error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** peut ÉCRIRE dans **${count}** salons !`);
    }

    if (command === 'reacttout') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+reacttout ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased());

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true,
            AddReactions: true
          });
          count++;
        } catch (error) {
          console.error(`Erreur sur ${channel.name}:`, error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** peut RÉAGIR dans **${count}** salons !`);
    }

    if (command === 'parlertout') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+parlertout ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.type === 2);

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true,
            Connect: true,
            Speak: true
          });
          count++;
        } catch (error) {
          console.error(`Erreur sur ${channel.name}:`, error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** peut PARLER dans **${count}** salons vocaux !`);
    }

    if (command === 'fulltout') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+fulltout ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased());

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true,
            SendMessages: true,
            AddReactions: true,
            AttachFiles: true,
            EmbedLinks: true,
            ReadMessageHistory: true
          });
          count++;
        } catch (error) {
          console.error(`Erreur sur ${channel.name}:`, error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** a TOUTES les permissions sur **${count}** salons !`);
    }

    if (command === 'mutetout') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+mutetout ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased());

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            SendMessages: false
          });
          count++;
        } catch (error) {
          console.error(`Erreur sur ${channel.name}:`, error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** ne peut plus ÉCRIRE dans **${count}** salons !`);
    }

    if (command === 'resettout') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+resettout ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased() || c.type === 2);

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.delete(role);
          count++;
        } catch (error) {
          console.error(`Erreur sur ${channel.name}:`, error);
        }
      }

      return message.reply(`✅ Permissions RÉINITIALISÉES pour le rôle **${role.name}** sur **${count}** salons !`);
    }

    // ===== COMMANDES PAR CATÉGORIE =====

    if (command === 'voircateg') {
      const roleId = args[0];
      const categoryName = args.slice(1).join(' ');

      if (!roleId || !categoryName) {
        return message.reply('❌ Usage: `+voircateg ID_ROLE nom de la catégorie`');
      }

      const role = message.guild.roles.cache.get(roleId);
      if (!role) return message.reply('❌ Rôle introuvable !');

      const category = message.guild.channels.cache.find(
        c => c.type === 4 && c.name.toLowerCase().includes(categoryName.toLowerCase())
      );

      if (!category) {
        return message.reply(`❌ Catégorie "${categoryName}" introuvable !`);
      }

      let count = 0;
      const channelsInCategory = message.guild.channels.cache.filter(c => c.parentId === category.id);

      for (const [id, channel] of channelsInCategory) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true
          });
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** peut VOIR **${count}** salons de **${category.name}** !`);
    }

    if (command === 'ecrirecateg') {
      const roleId = args[0];
      const categoryName = args.slice(1).join(' ');

      if (!roleId || !categoryName) {
        return message.reply('❌ Usage: `+ecrirecateg ID_ROLE nom de la catégorie`');
      }

      const role = message.guild.roles.cache.get(roleId);
      if (!role) return message.reply('❌ Rôle introuvable !');

      const category = message.guild.channels.cache.find(
        c => c.type === 4 && c.name.toLowerCase().includes(categoryName.toLowerCase())
      );

      if (!category) {
        return message.reply(`❌ Catégorie "${categoryName}" introuvable !`);
      }

      let count = 0;
      const channelsInCategory = message.guild.channels.cache.filter(
        c => c.parentId === category.id && c.isTextBased()
      );

      for (const [id, channel] of channelsInCategory) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true,
            SendMessages: true
          });
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** peut ÉCRIRE dans **${count}** salons de **${category.name}** !`);
    }

    if (command === 'fullcateg') {
      const roleId = args[0];
      const categoryName = args.slice(1).join(' ');

      if (!roleId || !categoryName) {
        return message.reply('❌ Usage: `+fullcateg ID_ROLE nom de la catégorie`');
      }

      const role = message.guild.roles.cache.get(roleId);
      if (!role) return message.reply('❌ Rôle introuvable !');

      const category = message.guild.channels.cache.find(
        c => c.type === 4 && c.name.toLowerCase().includes(categoryName.toLowerCase())
      );

      if (!category) {
        return message.reply(`❌ Catégorie "${categoryName}" introuvable !`);
      }

      let count = 0;
      const channelsInCategory = message.guild.channels.cache.filter(c => c.parentId === category.id);

      for (const [id, channel] of channelsInCategory) {
        try {
          if (channel.isTextBased()) {
            await channel.permissionOverwrites.edit(role, {
              ViewChannel: true,
              SendMessages: true,
              AddReactions: true,
              AttachFiles: true,
              EmbedLinks: true,
              ReadMessageHistory: true
            });
          } else if (channel.type === 2) {
            await channel.permissionOverwrites.edit(role, {
              ViewChannel: true,
              Connect: true,
              Speak: true
            });
          }
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`✅ Le rôle **${role.name}** a TOUTES les permissions sur **${count}** salons de **${category.name}** !`);
    }

    // ===== UTILITAIRES =====

    if (command === 'listcateg') {
      const categories = message.guild.channels.cache
        .filter(c => c.type === 4)
        .sort((a, b) => a.position - b.position)
        .map(c => {
          const channelCount = message.guild.channels.cache.filter(ch => ch.parentId === c.id).size;
          return `📁 **${c.name}** - \`${c.id}\` (${channelCount} salons)`;
        })
        .join('\n');

      if (!categories) {
        return message.reply('❌ Aucune catégorie trouvée sur ce serveur !');
      }

      return message.reply(`**📋 Liste des catégories :**\n${categories}`);
    }

    if (command === 'checkperm') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+checkperm ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let customPerms = 0;
      const channels = message.guild.channels.cache;

      for (const [id, channel] of channels) {
        if (channel.permissionOverwrites.cache.has(role.id)) {
          customPerms++;
        }
      }

      const permissions = role.permissions.toArray();
      const permsList = permissions.length > 0 ? permissions.join(', ') : 'Aucune permission serveur';

      return message.reply(`
**🔍 Informations sur le rôle ${role.name} :**
**ID:** \`${role.id}\`
**Couleur:** ${role.hexColor}
**Membres:** ${role.members.size}
**Position:** ${role.position}
**Permissions serveur:** ${permsList}
**Permissions custom:** ${customPerms} salons
      `);
    }

    if (command === 'cloneperm') {
      const sourceId = args[0];
      const destId = args[1];
      
      if (!sourceId || !destId) {
        return message.reply('❌ Usage: `+cloneperm ID_SOURCE ID_DESTINATION`');
      }

      const sourceRole = message.guild.roles.cache.get(sourceId);
      const destRole = message.guild.roles.cache.get(destId);
      
      if (!sourceRole || !destRole) {
        return message.reply('❌ Un des rôles est introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache;

      for (const [id, channel] of channels) {
        const sourcePerms = channel.permissionOverwrites.cache.get(sourceRole.id);
        
        if (sourcePerms) {
          try {
            await channel.permissionOverwrites.edit(destRole, {
              ...sourcePerms.allow.toJSON(),
            });
            count++;
          } catch (error) {
            console.error(error);
          }
        }
      }

      return message.reply(`✅ Permissions de **${sourceRole.name}** copiées vers **${destRole.name}** sur **${count}** salons !`);
    }

    // ===== PRESETS =====

    if (command === 'setupstaff') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+setupstaff ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      const staffCategories = ['staff', 'modération', 'admin', 'équipe'];
      let count = 0;

      for (const [id, channel] of message.guild.channels.cache) {
        const categoryName = channel.parent?.name.toLowerCase() || '';
        const isStaffCategory = staffCategories.some(cat => categoryName.includes(cat));

        if (isStaffCategory) {
          try {
            if (channel.isTextBased()) {
              await channel.permissionOverwrites.edit(role, {
                ViewChannel: true,
                SendMessages: true,
                AddReactions: true,
                AttachFiles: true,
                EmbedLinks: true,
                ReadMessageHistory: true,
                ManageMessages: true
              });
            } else if (channel.type === 2) {
              await channel.permissionOverwrites.edit(role, {
                ViewChannel: true,
                Connect: true,
                Speak: true,
                MuteMembers: true,
                DeafenMembers: true,
                MoveMembers: true
              });
            }
            count++;
          } catch (error) {
            console.error(error);
          }
        }
      }

      return message.reply(`✅ Setup STAFF appliqué au rôle **${role.name}** sur **${count}** salons !`);
    }

    if (command === 'setupmodo') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+setupmodo ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache;

      for (const [id, channel] of channels) {
        try {
          if (channel.isTextBased()) {
            await channel.permissionOverwrites.edit(role, {
              ViewChannel: true,
              SendMessages: true,
              ManageMessages: true,
              ReadMessageHistory: true
            });
          } else if (channel.type === 2) {
            await channel.permissionOverwrites.edit(role, {
              ViewChannel: true,
              Connect: true,
              Speak: true,
              MuteMembers: true,
              DeafenMembers: true
            });
          }
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`✅ Setup MODO appliqué au rôle **${role.name}** sur **${count}** salons !`);
    }

    if (command === 'setupmembre') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+setupmembre ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      const publicCategories = ['général', 'public', 'communauté', 'gaming', 'discussion'];
      let count = 0;

      for (const [id, channel] of message.guild.channels.cache) {
        const categoryName = channel.parent?.name.toLowerCase() || '';
        const isPublicCategory = publicCategories.some(cat => categoryName.includes(cat));

        if (isPublicCategory) {
          try {
            if (channel.isTextBased()) {
              await channel.permissionOverwrites.edit(role, {
                ViewChannel: true,
                SendMessages: true,
                AddReactions: true,
                ReadMessageHistory: true
              });
            } else if (channel.type === 2) {
              await channel.permissionOverwrites.edit(role, {
                ViewChannel: true,
                Connect: true,
                Speak: true
              });
            }
            count++;
          } catch (error) {
            console.error(error);
          }
        }
      }

      return message.reply(`✅ Setup MEMBRE appliqué au rôle **${role.name}** sur **${count}** salons publics !`);
    }

    if (command === 'setupvip') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+setupvip ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      const vipCategories = ['vip', 'premium', 'donateur', 'supporter'];
      let count = 0;

      for (const [id, channel] of message.guild.channels.cache) {
        const categoryName = channel.parent?.name.toLowerCase() || '';
        const isVipCategory = vipCategories.some(cat => categoryName.includes(cat));

        if (isVipCategory) {
          try {
            if (channel.isTextBased()) {
              await channel.permissionOverwrites.edit(role, {
                ViewChannel: true,
                SendMessages: true,
                AddReactions: true,
                AttachFiles: true,
                EmbedLinks: true,
                ReadMessageHistory: true
              });
            } else if (channel.type === 2) {
              await channel.permissionOverwrites.edit(role, {
                ViewChannel: true,
                Connect: true,
                Speak: true
              });
            }
            count++;
          } catch (error) {
            console.error(error);
          }
        }
      }

      return message.reply(`✅ Setup VIP appliqué au rôle **${role.name}** sur **${count}** salons VIP !`);
    }

    // ===== ACTIONS EN MASSE =====

    if (command === 'lockall') {
      const everyoneRole = message.guild.roles.everyone;
      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased());

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(everyoneRole, {
            SendMessages: false
          });
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`🔒 **${count}** salons verrouillés ! Personne ne peut écrire.`);
    }

    if (command === 'unlockall') {
      const everyoneRole = message.guild.roles.everyone;
      let count = 0;
      const channels = message.guild.channels.cache.filter(c => c.isTextBased());

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(everyoneRole, {
            SendMessages: null
          });
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`🔓 **${count}** salons déverrouillés !`);
    }

    if (command === 'hideall') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+hideall ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache;

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: false
          });
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`👁️‍🗨️ **${count}** salons cachés au rôle **${role.name}** !`);
    }

    if (command === 'showall') {
      const roleId = args[0];
      
      if (!roleId) {
        return message.reply('❌ Usage: `+showall ID_ROLE`');
      }

      const role = message.guild.roles.cache.get(roleId);
      
      if (!role) {
        return message.reply('❌ Rôle introuvable !');
      }

      let count = 0;
      const channels = message.guild.channels.cache;

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(role, {
            ViewChannel: true
          });
          count++;
        } catch (error) {
          console.error(error);
        }
      }

      return message.reply(`👁️ **${count}** salons visibles pour le rôle **${role.name}** !`);
    }
  }
};



// 🌐 COMMANDES GLOBALES
// +voirtout ID_ROLE → Voir tous les salons
// +ecriretout ID_ROLE → Écrire partout (textuels)
// +reacttout ID_ROLE → Réagir partout
// +parlertout ID_ROLE → Parler dans tous les vocaux
// +fulltout ID_ROLE → Toutes les permissions partout
// +mutetout ID_ROLE → Empêche d’écrire partout
// +resettout ID_ROLE → Réinitialise les permissions du rôle

// 📁 PAR CATÉGORIE
// +voircateg ID_ROLE nom_catégorie → Voir une catégorie
// +ecrirecateg ID_ROLE nom_catégorie → Écrire dans une catégorie
// +fullcateg ID_ROLE nom_catégorie → Toutes les perms sur une catégorie

// 📊 UTILITAIRES
// +listcateg → Liste des catégories + IDs
// +checkperm ID_ROLE → Infos complètes d’un rôle
// +cloneperm ID_SOURCE ID_DEST → Copie les permissions
// +roles → Liste des rôles + IDs

// ⚡ PRESETS
// +setupstaff ID_ROLE → Preset staff
// +setupmodo ID_ROLE → Preset modérateur
// +setupmembre ID_ROLE → Preset membre
// +setupvip ID_ROLE → Preset VIP

// 🔄 ACTIONS EN MASSE
// +lockall → Verrouille tous les salons
// +unlockall → Déverrouille tous les salons
// +hideall ID_ROLE → Cache tous les salons à un rôle
// +showall ID_ROLE → Montre tous les salons à un rôle
