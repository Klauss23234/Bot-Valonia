console.log('🔥 test.js chargé');

export default {
  name: 'ready',
  once: true,

  execute(client) {
    console.log('✅ EVENT READY OK — EVENTS CHARGÉS');
  }
};
