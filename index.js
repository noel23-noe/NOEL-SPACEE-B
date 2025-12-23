const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const { handleCommand } = require("./lib/commands")
const qrcode = require("qrcode-terminal") // generates QR in terminal

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  // Listen to connection updates (includes QR)
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("Scan this QR code with your WhatsApp:")
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log("Connection closed. Reason:", reason)
      console.log("Reconnecting...")
      startBot()
    }

    if (connection === "open") {
      console.log("✅ Bot connected!")
    }
  })

  // Listen for incoming messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (!text) return

    await handleCommand(sock, msg, text)
  })
}

startBot()
