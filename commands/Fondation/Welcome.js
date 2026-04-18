export const welcomeEvent = {
  name: 'guildMemberAdd',
  execute(member) {
    const channel = member.guild.systemChannel;
    if (!channel) return;

    channel.send(`Bienvenue ${member}`);
  }
};