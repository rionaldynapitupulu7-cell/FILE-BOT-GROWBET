const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const dbPath = './coin.json'
const loadDB = () => { try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')) } catch { return {} } }
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
const BOT_NAME = 'GrowBetBot'
const OWNER1 = '628218518931@s.whatsapp.net'
const OWNER2 = '6287840375516@s.whatsapp.net'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: [BOT_NAME, 'Chrome', '1.0.0'],
  })

  sock.ev.on('connection.update', ({ connection, qr, lastDisconnect }) => {
    if (qr) qrcode.generate(qr, { small: true })
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    }
    if (connection === 'open') console.log('✅ Bot Connected!')
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update
    if (action === 'add') {
      for (let p of participants) {
        try {
          const jid = typeof p === 'string' ? p : (p.id || p.jid || '')
          if (!jid) continue
          const num = jid.split('@')[0]
          const meta = await sock.groupMetadata(id)
          const total = meta.participants.length
          const txt = '🎰 *SELAMAT DATANG DI GROW BET* 🎰\n\n👤 *Member* : @' + num + '\n👥 *Grup* : ' + meta.subject + '\n📊 *Total* : ' + total + ' member\n\n━━━━━━━━━━━━━━━━━━━━━\n📌 *INFO PENTING*\n━━━━━━━━━━━━━━━━━━━━━\n✅ Daftarkan diri ke Owner\n💰 Min Deposit : *Rp 2.000*\n💸 Min WD : *Rp 10.000* | Tax 3%\n🎮 Min Bet : *Rp 500*\n\n🎮 Tersedia berbagai game seru\n🏆 Bonus & hadiah menarik!\n━━━━━━━━━━━━━━━━━━━━━\n💎 *GROW BET — Tempat Para Juara*\n🔥 _Semoga hoki selalu!_ 🍀'
          await sock.sendMessage(id, { image: { url: 'https://raw.githubusercontent.com/rionaldynapitupulu7-cell/Welcome/main/IMG-20260518-WA0020.jpg' }, caption: txt, mentions: [jid] })
        } catch(e) { console.error('Welcome error:', e.message) }
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim()
    const from = msg.key.remoteJid
    const senderJid = msg.key.participant || msg.key.remoteJid
    const L = '━━━━━━━━━━━━━━━━━━━━━'

    // CEK SALDO
    if (text.startsWith('.cs')) {
      const db = loadDB()
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      const targetJid = mentionedJid || senderJid
      if (!db[targetJid]) { db[targetJid] = { coin: 0 }; saveDB(db) }
      const coin = db[targetJid].coin || 0
      const tNum = targetJid.split('@')[0]
      const isOther = !!mentionedJid
      const status = coin > 0 ? '\u2705 Aktif' : '\u274C Kosong'
      const lines = [
        '\uD83C\uDFB0 *GROW BET \u2014 ' + (isOther ? 'CEK SALDO PLAYER' : 'CEK SALDO KAMU') + '* \uD83C\uDFB0',
        L,
        '',
        '\uD83D\uDC64 *Player* : @' + tNum,
        '\uD83D\uDCB0 *Saldo*  : *' + coin.toLocaleString('id-ID') + ' Coin*',
        '\uD83D\uDCCA *Status* : ' + status,
        '',
        L,
        '\uD83D\uDCCC *INFO TRANSAKSI*',
        L,
        '\uD83D\uDCE5 Depo           : *.deposit*',
        '\uD83D\uDCE4 Withdraw       : *.wd*',
        '\uD83D\uDCB8 Transfer Saldo : *.tf @user jumlah*',
        '',
        L,
        '\uD83E\uDD16 *GrowBetBot \u2014 Tempat Para Juara* \uD83C\uDFC6'
      ]
      await sock.sendMessage(from, { text: lines.join('\n'), mentions: [targetJid] }, { quoted: msg })
    }

    // CEK BOT
    if (text === '.cek') {
      await sock.sendMessage(from, { text: '\uD83C\uDFD3 *' + BOT_NAME + '* aktif! Pong! \u2705' }, { quoted: msg })
    }

    // MENU
    if (text === '.menu') {
      const t = [
        '\uD83C\uDFB0 *GROW BET BOT* \uD83C\uDFB0',
        L,
        '',
        '\uD83D\uDCB3 *\u2014 COIN & SALDO \u2014*',
        '\u250C \uD83D\uDCB5 *.cs* \u2014 Cek saldo coin',
        '\u251C \uD83C\uDF81 *.claim* \u2014 Bonus harian',
        '\u251C \uD83C\uDFE7 *.wd* \u2014 Ajukan penarikan',
        '\u251C \u274C *.batal* \u2014 Batalkan penarikan',
        '\u251C \uD83D\uDCCB *.antrian* \u2014 Lihat antrian WD',
        '\u2514 \uD83D\uDCB8 *.tf* \u2014 Transfer coin',
        '',
        L,
        '\uD83C\uDFAE *\u2014 PERMAINAN \u2014*',
        '\u250C \uD83C\uDFB0 *.spin* \u2014 Putar roulette',
        '\u251C \uD83C\uDCCF *.hit* \u2014 Blackjack',
        '\u251C \u2694\uFE0F *.duel* \u2014 Tantang pemain',
        '\u251C \uD83D\uDCCB *.room* \u2014 Lihat room PvP',
        '\u2514 \u274C *.cabut* \u2014 Tutup room PvP',
        '',
        L,
        '\uD83D\uDEE0\uFE0F *\u2014 UTILITAS \u2014*',
        '\u250C \uD83D\uDD22 *.hitung* \u2014 Kalkulator',
        '\u251C \uD83D\uDCE1 *.cek* \u2014 Cek bot aktif',
        '\u2514 \uD83D\uDE34 *.away* \u2014 Status AFK',
        '',
        L,
        '\uD83D\uDC65 *\u2014 INFO & BAYAR \u2014*',
        '\u250C \uD83D\uDC51 *.owner* \u2014 Info owner',
        '\u251C \uD83D\uDC64 *.hoster* \u2014 Info hoster',
        '\u251C \uD83D\uDCBC *.mitra* \u2014 Info mitra',
        '\u251C \uD83D\uDCF1 *.qris* \u2014 Lihat QRIS',
        '\u251C \uD83C\uDFE6 *.daftarqris* \u2014 Daftar QRIS',
        '\u2514 \uD83D\uDCB3 *.deposit* \u2014 Info deposit',
        '',
        L,
        '\uD83E\uDD16 *GrowBetBot \u2014 Tempat Para Juara* \uD83C\uDFC6',
        L
      ]
      await sock.sendMessage(from, { text: t.join('\n') }, { quoted: msg })
    }

    // OWNER
    if (text === '.owner') {
      const txt = [
        L,
        '\uD83D\uDC51 *GROW BET \u2014 OWNER LIST* \uD83D\uDC51',
        L,
        '',
        '\uD83E\uDD47 *[ OWNER UTAMA ]*',
        '\u2523\u2501 \uD83D\uDC64 *Nama*  : Owner GBET',
        '\u2523\u2501 \uD83D\uDCF1 *Kontak*: @' + OWNER1.split('@')[0],
        '\u2517\u2501 \uD83D\uDCAC *Role*  : _Founder & Admin Utama_',
        '',
        L,
        '\uD83E\uDD48 *[ OWNER KEDUA ]*',
        '\u2523\u2501 \uD83D\uDC64 *Nama*  : Poket Store',
        '\u2523\u2501 \uD83D\uDCF1 *Kontak*: @' + OWNER2.split('@')[0],
        '\u2517\u2501 \uD83D\uDCAC *Role*  : _Co-Owner & Partner_',
        '',
        L,
        '\u26A0\uFE0F _Hanya owner yg berhak kelola bot_',
        L,
        '\uD83E\uDD16 *GrowBetBot \u2014 Tempat Para Juara* \uD83C\uDFC6',
        L
      ].join('\n')
      await sock.sendMessage(from, { text: txt, mentions: [OWNER1, OWNER2] }, { quoted: msg })
    }

  })
}

startBot()
