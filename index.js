const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const delay = (ms) => new Promise(r => setTimeout(r, ms))
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const dbPath = './coin.json'
const loadDB = () => { try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')) } catch { return {} } }
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
const BOT_NAME = 'GrowBetBot'
const OWNER1 = '628218518931@s.whatsapp.net'
const OWNER2 = '6287840375516@s.whatsapp.net'
const OWNER_LID = '131950706745525@lid'

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
            await delay(2000 + Math.random() * 1000)
            await delay(2000 + Math.random() * 1000)
        try {
          const jid = typeof p === 'string' ? p : (p.id || p.jid || '')
          if (!jid) continue
          const num = jid.split('@')[0]
          const meta = await sock.groupMetadata(id)
          const total = meta.participants.length
        const txt = '🎰 *SELAMAT DATANG DI GROW BET* 🎰\n\n'

👤 *Member* : @' + num + '
👥 *Grup* : ' + meta.subject + '
📊 *Total* : ' + total + ' member

━━━━━━━━━━━━━━━━━━━━━
📌 *INFO PENTING*
━━━━━━━━━━━━━━━━━━━━━
✅ Daftarkan diri ke Owner
💰 Min Deposit : *Rp 2.000*
💸 Min WD : *Rp 10.000* | Tax 3%
🎮 Min Bet : *Rp 500*

🎮 Tersedia berbagai game seru
🏆 Bonus & hadiah menarik!
━━━━━━━━━━━━━━━━━━━━━
💎 *GROW BET — Tempat Para Juara*
🔥 _Semoga hoki selalu!_ 🍀'
          await delay(1500 + Math.random() * 1000)
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
    const isOwner = senderJid === OWNER1 || senderJid === OWNER2 || senderJid === OWNER_LID

    // CEK BOT
    if (text === '.cek') {
      await sock.sendMessage(from, { text: '🎳 *' + BOT_NAME + '* aktif! Pong! ✅' }, { quoted: msg })
    }

    // CEK SALDO
    if (text.startsWith('.cs')) {
      const db = loadDB()
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      const targetJid = mentionedJid || senderJid
      if (!db[targetJid]) { db[targetJid] = { coin: 0 }; saveDB(db) }
      const coin = db[targetJid].coin || 0
      const tNum = targetJid.split('@')[0]
      const isOther = !!mentionedJid
      const status = coin > 0 ? '✅ Aktif' : '❌ Kosong'
      const txt = L + '
🎰 *GROW BET — ' + (isOther ? 'CEK SALDO PLAYER' : 'CEK SALDO KAMU') + '* 🎰
' + L + '

👤 *Player* : @' + tNum + '
💰 *Saldo*  : *Rp ' + coin.toLocaleString('id-ID') + '*
📊 *Status* : ' + status + '

' + L + '
📌 *INFO TRANSAKSI*
' + L + '
📥 Depo           : *.deposit*
📤 Withdraw       : *.wd*
💸 Transfer Saldo : *.tf @user jumlah*

' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆'
      await sock.sendMessage(from, { text: txt, mentions: [targetJid] }, { quoted: msg })
    }

    // MENU
    if (text === '.menu') {
      const t = [
        '🎰 *GROW BET BOT* 🎰', L, '',
        '💳 *— COIN & SALDO —*',
        '┌ 💵 *.cs* — Cek saldo',
        '├ 🎁 *.claim* — Bonus harian',
        '├ 🏧 *.wd* — Ajukan penarikan',
        '├ ❌ *.batal* — Batalkan penarikan',
        '├ 📋 *.antrian* — Lihat antrian WD',
        '└ 💸 *.tf* — Transfer saldo',
        '', L,
        '🎮 *— PERMAINAN —*',
        '┌ 🎰 *.spin* — Putar roulette',
        '├ 🃏 *.hit* — Blackjack',
        '├ ⚔️ *.duel* — Tantang pemain',
        '├ 📋 *.room* — Lihat room PvP',
        '└ ❌ *.cabut* — Tutup room PvP',
        '', L,
        '🛠️ *— UTILITAS —*',
        '┌ 🔢 *.hitung* — Kalkulator',
        '├ 📡 *.ping* — Cek ping bot',
        '├ 📣 *.cek* — Cek bot aktif',
        '└ 😴 *.away* — Status AFK',
        '', L,
        '👥 *— INFO & BAYAR —*',
        '┌ 👑 *.owner* — Info owner',
        '├ 👤 *.hoster* — Info hoster',
        '├ 📊 *.lb* — Leaderboard saldo',
        '├ 👥 *.staff* — Info staff',
        '├ 💸 *.reseller* — Info reseller',
        '├ 📱 *.qris* — Lihat QRIS',
        '└ 💳 *.deposit* — Info deposit',
        '', L,
        '🤖 *GrowBetBot — Tempat Para Juara* 🏆', L
      ]
      await sock.sendMessage(from, { text: t.join('
') }, { quoted: msg })
    }

    // OWNER
    if (text === '.owner') {
      const txt = L + '
👑 *GROW BET — OWNER LIST* 👑
' + L + '

🥇 *[ OWNER UTAMA ]*
┣━ 👤 *Nama*  : Owner GBET
┣━ 📱 *Kontak*: @' + OWNER1.split('@')[0] + '
┗━ 💬 *Role*  : _Founder & Admin Utama_

' + L + '
🥈 *[ OWNER KEDUA ]*
┣━ 👤 *Nama*  : Poket Store
┣━ 📱 *Kontak*: @' + OWNER2.split('@')[0] + '
┗━ 💬 *Role*  : _Co-Owner & Partner_

' + L + '
⚠️ _Hanya owner yg berhak kelola bot_
' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
      await sock.sendMessage(from, { text: txt, mentions: [OWNER1, OWNER2] }, { quoted: msg })
    }

    // STAFF
    if (text === '.staff') {
      const staffJid = '6288286871607@s.whatsapp.net'
      const staffJid2 = '6281239105522@s.whatsapp.net'
      const txt = L + '
👥 *GROW BET — STAFF LIST* 👥
' + L + '

🌟 *[ STAFF AKTIF ]*
┏━━━━━━━━━━━━━━━━━━━━
┃ 🎖️ *Jabatan* : Staff Official
┃ 👤 *Nama*    : Staff GBET
┃ 📱 *Kontak*  : @' + staffJid.split('@')[0] + '
┃ 💼 *Tugas*   : _Melayani & Membantu Member_
┗━━━━━━━━━━━━━━━━━━━━

🌟 *[ STAFF 2 ]*
┏━━━━━━━━━━━━━━━━━━━━
┃ 🎖️ *Jabatan* : Staff Official
┃ 👤 *Nama*    : Staff GBET 2
┃ 📱 *Kontak*  : @' + staffJid2.split('@')[0] + '
┃ 💼 *Tugas*   : _Melayani & Membantu Member_
┗━━━━━━━━━━━━━━━━━━━━

' + L + '
📌 *LAYANAN STAFF*
' + L + '
✅ Bantuan Deposit & Withdraw
✅ Konfirmasi Transaksi
✅ Laporan Kendala & Komplain
✅ Info Promo & Bonus

' + L + '
⚠️ _Hubungi staff hanya untuk keperluan resmi_
🕐 _Jam Layanan: 08.00 — 24.00 WIB_
' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
      await sock.sendMessage(from, { text: txt, mentions: [staffJid, staffJid2] }, { quoted: msg })
    }

    // RESELLER
    if (text === '.reseller') {
      const r1 = '6287854189807'; const r2 = '6282334880404'; const r3 = '6285717707402'
      const txt = L + '
💸 *GROW BET — RESELLER LIST* 💸
' + L + '

📊 *[ DAFTAR RESELLER AKTIF ]*

🥇 *RESELLER #1*
┏━━━━━━━━━━━━━━━━━━━━
┃ 👤 *Nama*    : Reseller 1
┃ 📱 *Kontak*  : @' + r1 + '
┃ 💰 *Layanan* : _Jual Beli Saldo_
┃ ✅ *Status*  : _Aktif_
┗━━━━━━━━━━━━━━━━━━━━

🥈 *RESELLER #2*
┏━━━━━━━━━━━━━━━━━━━━
┃ 👤 *Nama*    : Reseller 2
┃ 📱 *Kontak*  : @' + r2 + '
┃ 💰 *Layanan* : _Jual Beli Saldo_
┃ ✅ *Status*  : _Aktif_
┗━━━━━━━━━━━━━━━━━━━━

🥉 *RESELLER #3*
┏━━━━━━━━━━━━━━━━━━━━
┃ 👤 *Nama*    : Reseller 3
┃ 📱 *Kontak*  : @' + r3 + '
┃ 💰 *Layanan* : _Jual Beli Saldo_
┃ ✅ *Status*  : _Aktif_
┗━━━━━━━━━━━━━━━━━━━━

🌟 *[ STAFF 2 ]*
┏━━━━━━━━━━━━━━━━━━━━
┃ 🎖️ *Jabatan* : Staff Official
┃ 👤 *Nama*    : Staff GBET 2
┃ 📱 *Kontak*  : @' + staffJid2.split('@')[0] + '
┃ 💼 *Tugas*   : _Melayani & Membantu Member_
┗━━━━━━━━━━━━━━━━━━━━

' + L + '
📌 *INFO RESELLER*
' + L + '
💵 _Beli & jual saldo lewat reseller terpercaya_
🚫 _Hati-hati penipuan mengatasnamakan reseller_
🕐 _Jam Layanan: 08.00 — 24.00 WIB_
' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
      await sock.sendMessage(from, { text: txt, mentions: [r1+'@s.whatsapp.net', r2+'@s.whatsapp.net', r3+'@s.whatsapp.net'] }, { quoted: msg })
    }

    // QRIS
    if (text === '.qris' || text === '.qr') {
      const txt = L + '
💳 *[ GROW BET — PEMBAYARAN QRIS ]* 💳
' + L + '

🏦 *INFO PEMBAYARAN*
┏━━━━━━━━━━━━━━━━━━━━
┃ 🏪 *Merchant* : GROW BET
┃ 💳 *Metode*   : QRIS (All Payment)
┃ ✅ *Status*   : _Aktif & Tersedia_
┗━━━━━━━━━━━━━━━━━━━━

🌟 *[ STAFF 2 ]*
┏━━━━━━━━━━━━━━━━━━━━
┃ 🎖️ *Jabatan* : Staff Official
┃ 👤 *Nama*    : Staff GBET 2
┃ 📱 *Kontak*  : @' + staffJid2.split('@')[0] + '
┃ 💼 *Tugas*   : _Melayani & Membantu Member_
┗━━━━━━━━━━━━━━━━━━━━

' + L + '
📋 *CARA PEMBAYARAN*
' + L + '
1️⃣ Screenshot / scan QR di atas
2️⃣ Buka aplikasi e-wallet / m-banking
3️⃣ Pilih menu *Scan QR / QRIS*
4️⃣ Masukkan nominal deposit
5️⃣ Konfirmasi ke Owner / Staff

' + L + '
💰 *INFO DEPOSIT*
' + L + '
💵 *Min Deposit* : Rp 2.000
🏧 *Diterima*    : _Semua e-wallet & bank_
⚡ *Proses*      : _Instan & Otomatis_

' + L + '
⚠️ _Simpan bukti transfer sebelum konfirmasi_
🕐 _Layanan: 08.00 — 24.00 WIB_
' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
      await sock.sendMessage(from, { image: { url: './qris.jpg' }, caption: txt }, { quoted: msg })
    }

    // PING
    if (text === '.ping') {
      const start = Date.now()
      await new Promise(r => setTimeout(r, 500))
      const ping = Date.now() - start
      let icon, status, speed
      if (ping < 100) { icon = '⚡'; status = 'KENCENG BANGET'; speed = '🟢' }
      else if (ping < 300) { icon = '🚀'; status = 'NGEBUT'; speed = '🟡' }
      else if (ping < 600) { icon = '🐢'; status = 'LEMOT'; speed = '🔴' }
      else { icon = '🐌'; status = 'SANGAT LEMOT'; speed = '⛔' }
      const pct = Math.max(1, Math.min(10, Math.round(10 - (ping/200))))
      const bar = '▰'.repeat(pct) + '▱'.repeat(10 - pct)
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = '🎰 *GROW BET BOT* 🎰
' + L + '
' + icon + ' *PING RESULT*
' + L + '
📡 *Latensi* : *' + ping + ' ms*
📊 *Sinyal*  : ' + bar + '
' + speed + ' *Status*  : ' + status + '
🕐 *Waktu*   : ' + now + '
' + L + '
✅ *Bot Online & Siap Melayani!*
🎯 *Tempat Para Juara* 🏆'
      await sock.sendMessage(from, { text: txt }, { quoted: msg })
    }

    // LEADERBOARD
    if (text === '.lb') {
      const db = loadDB()
      const entries = Object.entries(db).filter(([jid]) => jid.includes('@s.whatsapp.net') || jid.includes('@lid')).map(([jid, data]) => ({ jid, coin: data.coin || 0 })).sort((a, b) => b.coin - a.coin)
      const top = entries.slice(0, 10)
      const maxCoin = top.length > 0 ? top[0].coin : 0
      const totalSaldo = entries.reduce((s, e) => s + e.coin, 0)
      const aktif = entries.filter(e => e.coin > 0).length
      const kosong = entries.filter(e => e.coin === 0).length
      const medals = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅']
      const mentionList = top.map(e => e.jid)
      const rajaJid = top.length > 0 ? top[0].jid : null
      const rajaNum = rajaJid ? rajaJid.split('@')[0] : '-'
      let rankTxt = ''
      for (let i = 0; i < top.length; i++) {
        const e = top[i]; const num = e.jid.split('@')[0]
        const pct = maxCoin > 0 ? Math.round((e.coin / maxCoin) * 10) : 0
        const bar = '▰'.repeat(pct) + '▱'.repeat(10 - pct)
        const status = e.coin > 0 ? '🔥' : '💤'
        rankTxt += medals[i] + ' @' + num + ' ' + status + '
     💰 *Rp ' + e.coin.toLocaleString('id-ID') + '*
     ' + bar + ' ' + (maxCoin > 0 ? Math.round((e.coin/maxCoin)*100) : 0) + '%

'
      }
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '
🏆 *LEADERBOARD GROW BET* 🏆
' + L + '
👑 *Raja Saldo:* @' + rajaNum + '
💎 *Saldo Teratas:* Rp ' + maxCoin.toLocaleString('id-ID') + '
' + L + '
📊 *RANKING SALDO*

' + rankTxt + L + '
📈 *STATISTIK GRUP*
👥 Total: *' + entries.length + ' orang*
✅ Aktif: *' + aktif + ' orang*
💤 Kosong: *' + kosong + ' orang*
💵 Total Saldo: *Rp ' + totalSaldo.toLocaleString('id-ID') + '*
🕒 ' + now + '
' + L + '
🔥 _Tingkatkan saldo dengan_ *.deposit*!'
      await sock.sendMessage(from, { text: txt, mentions: mentionList }, { quoted: msg })
    }

    // REGISTRASI PLAYER
    if (text.startsWith('.reg') && !text.startsWith('.reg all')) {
      if (!isOwner) { await sock.sendMessage(from, { text: '❌ Hanya *Owner* yang bisa daftarkan member!' }, { quoted: msg }); return }
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      if (!mentionedJid) { await sock.sendMessage(from, { text: '⚠️ Gunakan format: *.reg @member*' }, { quoted: msg }); return }
      const db = loadDB()
      const num = mentionedJid.split('@')[0]
      if (db[mentionedJid]) {
        const coin = db[mentionedJid].coin || 0
        const txt = L + '
⚠️ *[ REGISTRASI MEMBER ]* ⚠️
' + L + '
👤 *Member*  : @' + num + '
❌ *Status*  : _Sudah terdaftar sebelumnya_
💰 *Saldo*   : *Rp ' + coin.toLocaleString('id-ID') + '*
📊 *Akses*   : _Sudah aktif_

' + L + '
💡 _Gunakan .cs untuk cek saldo_

' + L + '
🤖 *GrowBetBot — Para Juara* 🏆
' + L
        await sock.sendMessage(from, { text: txt, mentions: [mentionedJid] }, { quoted: msg })
      } else {
        db[mentionedJid] = { coin: 0, nama: num, terdaftar: new Date().toISOString() }
        saveDB(db)
        const txt = L + '
✅ *[ REGISTRASI MEMBER ]* ✅
' + L + '
👤 *Member*  : @' + num + '
✅ *Status*  : _Berhasil terdaftar!_
💰 *Saldo*   : *Rp 0*
📊 *Akses*   : _Aktif_

' + L + '
💡 _Gunakan .cs untuk cek saldo_

' + L + '
🤖 *GrowBetBot — Para Juara* 🏆
' + L
        await sock.sendMessage(from, { text: txt, mentions: [mentionedJid] }, { quoted: msg })
      }
    }

    // REG ALL
    if (text === '.reg all') {
      if (!isOwner) { await sock.sendMessage(from, { text: '❌ Hanya *Owner* yang bisa pakai cmd ini!' }, { quoted: msg }); return }
      try {
        const meta = await sock.groupMetadata(from)
        const db = loadDB()
        let berhasil = 0; let sudahAda = 0; let listBaru = []
        for (const p of meta.participants) {
          const jid = p.id
          if (!db[jid]) {
            db[jid] = { coin: 0, nama: jid.split('@')[0], terdaftar: new Date().toISOString() }
            if (!jid.includes('@lid')) listBaru.push(jid)
            berhasil++
          } else { sudahAda++ }
        }
        saveDB(db)
        const daftarBaru = listBaru.length > 0 ? listBaru.map(j => '@' + j.split('@')[0]).join('
') : '_Semua sudah terdaftar_'
        const txt = L + '
♔ *[ GROW BET — REGISTRASI MASSAL ]* ♔
' + L + '
📊 *Laporan Registrasi Grup*
' + L + '
👥 *Total Member*     : *' + meta.participants.length + ' orang*
✅ *Berhasil Daftar*  : *' + berhasil + ' member*
⚠️  *Sudah Terdaftar* : *' + sudahAda + ' member*

' + L + '
📋 *DAFTAR MEMBER BARU*
' + L + '
' + daftarBaru + '

' + L + '
💰 *Saldo Awal*  : Rp 0
🎯 *Status*      : _Aktif & Siap Bermain!_
🔒 *Akses*       : _Semua Fitur Bot_

' + L + '
🏆 _Selamat bergabung di GrowBet!_
💫 _Semoga selalu hoki & cuan!_ 🍀

' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
        await sock.sendMessage(from, { text: txt, mentions: listBaru }, { quoted: msg })
      } catch (e) {
        await sock.sendMessage(from, { text: '❌ Gagal reg all: ' + e.message }, { quoted: msg })
      }
    }

    // TAMBAH SALDO SENDIRI (OWNER)
    if (text.startsWith('.tss')) {
      if (!isOwner) { await sock.sendMessage(from, { text: '❌ Cmd ini khusus *Owner* saja!' }, { quoted: msg }); return }
      const args = text.split(' ')
      const rawNum = args[args.length - 1].toLowerCase()
      let jumlah = 0
      if (rawNum.endsWith('jt')) jumlah = parseFloat(rawNum) * 1000000
      else if (rawNum.endsWith('k')) jumlah = parseFloat(rawNum) * 1000
      else jumlah = parseInt(rawNum)
      jumlah = Math.floor(jumlah)
      if (!jumlah || isNaN(jumlah) || jumlah <= 0) { await sock.sendMessage(from, { text: '⚠️ Format: *.tss jumlah*
Contoh: *.tss 5k* / *.tss 100k* / *.tss 1jt*' }, { quoted: msg }); return }
      const db = loadDB()
      if (!db[senderJid]) db[senderJid] = { coin: 0, nama: senderJid.split('@')[0], terdaftar: new Date().toISOString() }
      const before = db[senderJid].coin || 0
      db[senderJid].coin = before + jumlah
      const after = db[senderJid].coin
      saveDB(db)
      const num = senderJid.split('@')[0]
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '
👑 *[ GROW BET — TAMBAH SALDO OWNER ]* 👑
' + L + '

🎯 *Target*    : @' + num + '
👑 *Role*      : Owner

' + L + '
💰 *DETAIL TRANSAKSI*
' + L + '
📤 *Saldo Awal* : *Rp ' + before.toLocaleString('id-ID') + '*
➕ *Ditambah*   : *+Rp ' + jumlah.toLocaleString('id-ID') + '*
📥 *Saldo Akhir*: *Rp ' + after.toLocaleString('id-ID') + '*

' + L + '
✅ _Saldo berhasil ditambahkan!_
🕐 ' + now + '
' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
      await sock.sendMessage(from, { text: txt, mentions: [senderJid] }, { quoted: msg })
    }

    // TAMBAH SALDO KE PLAYER (OWNER)
    if (text.startsWith('.ts') && !text.startsWith('.tss')) {
      if (!isOwner) { await sock.sendMessage(from, { text: '❌ Cmd ini khusus *Owner* saja!' }, { quoted: msg }); return }
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      const args = text.split(' ')
      const rawNum = args[args.length - 1].toLowerCase()
      let jumlah = 0
      if (rawNum.endsWith('jt')) jumlah = parseFloat(rawNum) * 1000000
      else if (rawNum.endsWith('k')) jumlah = parseFloat(rawNum) * 1000
      else jumlah = parseInt(rawNum)
      jumlah = Math.floor(jumlah)
      if (!jumlah || isNaN(jumlah) || jumlah <= 0) { await sock.sendMessage(from, { text: '⚠️ Format: *.ts @player jumlah*
Contoh: *.ts @628xxx 5k*' }, { quoted: msg }); return }
      const targetJid = mentionedJid || senderJid
      const db = loadDB()
      if (!db[targetJid]) db[targetJid] = { coin: 0, nama: targetJid.split('@')[0], terdaftar: new Date().toISOString() }
      const before = db[targetJid].coin || 0
      db[targetJid].coin = before + jumlah
      const after = db[targetJid].coin
      saveDB(db)
      const num = targetJid.split('@')[0]
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '
💎 *[ GROW BET — TAMBAH SALDO ]* 💎
' + L + '

🎯 *Target*    : @' + num + '
👑 *Oleh*      : Owner

' + L + '
💰 *DETAIL TRANSAKSI*
' + L + '
📤 *Saldo Awal* : *Rp ' + before.toLocaleString('id-ID') + '*
➕ *Ditambah*   : *+Rp ' + jumlah.toLocaleString('id-ID') + '*
📥 *Saldo Akhir*: *Rp ' + after.toLocaleString('id-ID') + '*

' + L + '
✅ _Saldo berhasil ditambahkan!_
🕐 ' + now + '
' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
      const mList = mentionedJid ? [mentionedJid] : [senderJid]
      await sock.sendMessage(from, { text: txt, mentions: mList }, { quoted: msg })
    }

    // KURANGI SALDO (OWNER)
    if (text.startsWith('.ks')) {
      if (!isOwner) { await sock.sendMessage(from, { text: '❌ Cmd ini khusus *Owner* saja!' }, { quoted: msg }); return }
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      const args = text.split(' ')
      const rawNum = args[args.length - 1].toLowerCase()
      let jumlah = 0
      if (rawNum.endsWith('jt')) jumlah = parseFloat(rawNum) * 1000000
      else if (rawNum.endsWith('k')) jumlah = parseFloat(rawNum) * 1000
      else jumlah = parseInt(rawNum)
      jumlah = Math.floor(jumlah)
      if (!jumlah || isNaN(jumlah) || jumlah <= 0) { await sock.sendMessage(from, { text: '⚠️ Format: *.ks @player jumlah*
Contoh: *.ks @628xxx 5k*' }, { quoted: msg }); return }
      const targetJid = mentionedJid || senderJid
      const db = loadDB()
      if (!db[targetJid]) { await sock.sendMessage(from, { text: '❌ Player tidak ditemukan di database!' }, { quoted: msg }); return }
      const before = db[targetJid].coin || 0
      if (jumlah > before) { await sock.sendMessage(from, { text: '⚠️ Saldo tidak cukup!
💰 Saldo saat ini: *Rp ' + before.toLocaleString('id-ID') + '*' }, { quoted: msg }); return }
      db[targetJid].coin = before - jumlah
      const after = db[targetJid].coin
      saveDB(db)
      const num = targetJid.split('@')[0]
      const pct = before > 0 ? Math.round((after / before) * 10) : 0
      const bar = '▰'.repeat(pct) + '▱'.repeat(10 - pct)
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '
🔻 *[ GROW BET — KURANGI SALDO ]* 🔻
' + L + '

🎯 *Target*    : @' + num + '
👑 *Oleh*      : Owner

' + L + '
💸 *DETAIL TRANSAKSI*
' + L + '
📤 *Saldo Awal* : *Rp ' + before.toLocaleString('id-ID') + '*
➖ *Dikurangi*  : *-Rp ' + jumlah.toLocaleString('id-ID') + '*
📥 *Saldo Akhir*: *Rp ' + after.toLocaleString('id-ID') + '*
📊 *Sisa Saldo* : ' + bar + ' ' + (before > 0 ? Math.round((after/before)*100) : 0) + '%

' + L + '
✅ _Saldo berhasil dikurangi!_
🕐 ' + now + '
' + L + '
🤖 *GrowBetBot — Tempat Para Juara* 🏆
' + L
      const mList = mentionedJid ? [mentionedJid] : [senderJid]
      await sock.sendMessage(from, { text: txt, mentions: mList }, { quoted: msg })
    }

    // TRANSFER SALDO
    if (text.startsWith('.tf')) {
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      if (!mentionedJid) { await sock.sendMessage(from, { text: '⚠️ Format: *.tf @player jumlah*
Contoh: *.tf @628xxx 5k*' }, { quoted: msg }); return }
      if (mentionedJid === senderJid) { await sock.sendMessage(from, { text: '❌ Tidak bisa transfer ke diri sendiri!' }, { quoted: msg }); return }
      const args = text.split(' ')
      const rawNum = args[args.length - 1].toLowerCase()
      let jumlah = 0
      if (rawNum.endsWith('jt')) jumlah = parseFloat(rawNum) * 1000000
      else if (rawNum.endsWith('k')) jumlah = parseFloat(rawNum) * 1000
      else jumlah = parseInt(rawNum)
      jumlah = Math.floor(jumlah)
      if (!jumlah || isNaN(jumlah) || jumlah <= 0) { await sock.sendMessage(from, { text: '⚠️ Jumlah transfer tidak valid!' }, { quoted: msg }); return }
      const db = loadDB()
      if (!db[senderJid]) { await sock.sendMessage(from, { text: '❌ Kamu belum terdaftar! Ketik *.reg* dulu' }, { quoted: msg }); return }
      if (!db[mentionedJid]) { await sock.sendMessage(from, { text: '❌ Player tujuan belum terdaftar!' }, { quoted: msg }); return }
      const saldoPengirim = db[senderJid].coin || 0
      const resellers = ['6287854189807@s.whatsapp.net', '6282334880404@s.whatsapp.net', '6285717707402@s.whatsapp.net']
      const isFreeTax = resellers.includes(senderJid) || isOwner || senderJid === staffJid || senderJid === staffJid2
      const tax = isFreeTax ? 0 : Math.floor(jumlah * 0.03)
      const totalKurang = jumlah + tax
      if (saldoPengirim < totalKurang) { await sock.sendMessage(from, { text: '❌ Saldo tidak cukup!
💰 Saldo kamu: *Rp ' + saldoPengirim.toLocaleString('id-ID') + '*
💸 Butuh: *Rp ' + totalKurang.toLocaleString('id-ID') + '*' }, { quoted: msg }); return }
      db[senderJid].coin = saldoPengirim - totalKurang
      db[mentionedJid].coin = (db[mentionedJid].coin || 0) + jumlah
      saveDB(db)
      const numFrom = senderJid.split('@')[0]
      const numTo = mentionedJid.split('@')[0]
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const taxInfo = isFreeTax ? '💎 *Pajak*            : *FREE (Owner/Staff/Reseller)*' : '💸 *Pajak*            : *Rp ' + tax.toLocaleString('id-ID') + ' (3%)*'
        const statusInfo = isFreeTax ? '✅ Bebas TAX' : '💸 Kena TAX 3%'
        const trxId = 'GBET-' + Math.random().toString(36).substring(2,8).toUpperCase()
        const txt = L + '
✅ *TRANSFER BERHASIL* ✅
' + L + '
🧾 *ID Transaksi* : *' + trxId + '*

👤 *Pengirim*             : @' + numFrom + '
🎯 *Penerima*             : @' + numTo + '

' + L + '
💵 *Nominal Transfer* : *Rp ' + jumlah.toLocaleString('id-ID') + '*
' + taxInfo + '
💰 *Diterima*             : *Rp ' + (jumlah - tax).toLocaleString('id-ID') + '*
📌 *Status*               : ' + statusInfo + '

' + L + '
📌 *SALDO TERBARU*
• 🧍 Sisa saldo kamu    : *Rp ' + db[senderJid].coin.toLocaleString('id-ID') + '*
• 🧑‍🤝‍🧑 Saldo penerima : *Rp ' + db[mentionedJid].coin.toLocaleString('id-ID') + '*

🕒 *Waktu* : ' + now + '
' + L
    }

  })
}

startBot()
