// Session generator using Baileys
const fs = require("fs");
const { Boom } = require("@hapi/boom");
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");

const { state, saveState } = useSingleFileAuthState('./session.json');

async function startSession() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log("✅ SESSION_ID generated successfully.");
    } else if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startSession();
    }
  });

  sock.ev.on('creds.update', saveState);
}
module.exports = { startSession };