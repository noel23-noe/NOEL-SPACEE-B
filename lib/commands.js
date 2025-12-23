const config = require("../config")

async function handleCommand(sock, msg, text) {
  const prefix = config.prefix
  if (!text.startsWith(prefix)) return

  const cmd = text.slice(1).trim().toLowerCase()
  const jid = msg.key.remoteJid

  if (cmd === "ping") {
    return sock.sendMessage(jid, { text: "Pong ✅" })
  }

  if (cmd === "menu") {
    return sock.sendMessage(jid, {
      text:
`🤖 *${config.botName}*

• .ping
• .menu

_Real Cypher-X style_`
    })
  }
}

module.exports = { handleCommand }
