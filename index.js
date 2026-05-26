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
          const txt = '🎰 *SELAMAT DATANG DI GROW BET* 🎰\n\n👤 *Member* : @' + num + '\n👥 *Grup* : ' + meta.subject + '\n📊 *Total* : ' + total + ' member\n\n━━━━━━━━━━━━━━━━━━━━━\n📌 *INFO PENTING*\n━━━━━━━━━━━━━━━━━━━━━\n✅ Daftarkan diri ke Owner\n💰 Min Deposit : *Rp 2.000*\n💸 Min WD : *Rp 10.000* | Tax 3%\n🎮 Min Bet : *Rp 500*\n\n🎮 Tersedia berbagai game seru\n🏆 Bonus & hadiah menarik!\n━━━━━━━━━━━━━━━━━━━━━\n💎 *GROW BET — Tempat Para Juara*\n🔥 _Semoga hoki selalu!_ 🍀'
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
      const txt = L + '\n🎰 *GROW BET — ' + (isOther ? 'CEK SALDO PLAYER' : 'CEK SALDO KAMU') + '* 🎰\n' + L + '\n\n👤 *Player* : @' + tNum + '\n💰 *Saldo*  : *Rp ' + coin.toLocaleString('id-ID') + '*\n📊 *Status* : ' + status + '\n\n' + L + '\n📌 *INFO TRANSAKSI*\n' + L + '\n📥 Depo           : *.deposit*\n📤 Withdraw       : *.wd*\n💸 Transfer Saldo : *.tf @user jumlah*\n\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆'
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
      await sock.sendMessage(from, { text: t.join('\n') }, { quoted: msg })
    }

    // OWNER
    if (text === '.owner') {
      const txt = L + '\n👑 *GROW BET — OWNER LIST* 👑\n' + L + '\n\n🥇 *[ OWNER UTAMA ]*\n┣━ 👤 *Nama*  : Owner GBET\n┣━ 📱 *Kontak*: @' + OWNER1.split('@')[0] + '\n┗━ 💬 *Role*  : _Founder & Admin Utama_\n\n' + L + '\n🥈 *[ OWNER KEDUA ]*\n┣━ 👤 *Nama*  : Poket Store\n┣━ 📱 *Kontak*: @' + OWNER2.split('@')[0] + '\n┗━ 💬 *Role*  : _Co-Owner & Partner_\n\n' + L + '\n⚠️ _Hanya owner yg berhak kelola bot_\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
      await sock.sendMessage(from, { text: txt, mentions: [OWNER1, OWNER2] }, { quoted: msg })
    }

    // STAFF
    if (text === '.staff') {
      const staffJid = '6282886871607@s.whatsapp.net'
      const txt = L + '\n👥 *GROW BET — STAFF LIST* 👥\n' + L + '\n\n🌟 *[ STAFF AKTIF ]*\n┏━━━━━━━━━━━━━━━━━━━━\n┃ 🎖️ *Jabatan* : Staff Official\n┃ 👤 *Nama*    : Staff GBET\n┃ 📱 *Kontak*  : @' + staffJid.split('@')[0] + '\n┃ 💼 *Tugas*   : _Melayani & Membantu Member_\n┗━━━━━━━━━━━━━━━━━━━━\n\n' + L + '\n📌 *LAYANAN STAFF*\n' + L + '\n✅ Bantuan Deposit & Withdraw\n✅ Konfirmasi Transaksi\n✅ Laporan Kendala & Komplain\n✅ Info Promo & Bonus\n\n' + L + '\n⚠️ _Hubungi staff hanya untuk keperluan resmi_\n🕐 _Jam Layanan: 08.00 — 24.00 WIB_\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
      await sock.sendMessage(from, { text: txt, mentions: [staffJid] }, { quoted: msg })
    }

    // RESELLER
    if (text === '.reseller') {
      const r1 = '6287854189807'; const r2 = '6282334880404'; const r3 = '6285717707402'
      const txt = L + '\n💸 *GROW BET — RESELLER LIST* 💸\n' + L + '\n\n📊 *[ DAFTAR RESELLER AKTIF ]*\n\n🥇 *RESELLER #1*\n┏━━━━━━━━━━━━━━━━━━━━\n┃ 👤 *Nama*    : Reseller 1\n┃ 📱 *Kontak*  : @' + r1 + '\n┃ 💰 *Layanan* : _Jual Beli Saldo_\n┃ ✅ *Status*  : _Aktif_\n┗━━━━━━━━━━━━━━━━━━━━\n\n🥈 *RESELLER #2*\n┏━━━━━━━━━━━━━━━━━━━━\n┃ 👤 *Nama*    : Reseller 2\n┃ 📱 *Kontak*  : @' + r2 + '\n┃ 💰 *Layanan* : _Jual Beli Saldo_\n┃ ✅ *Status*  : _Aktif_\n┗━━━━━━━━━━━━━━━━━━━━\n\n🥉 *RESELLER #3*\n┏━━━━━━━━━━━━━━━━━━━━\n┃ 👤 *Nama*    : Reseller 3\n┃ 📱 *Kontak*  : @' + r3 + '\n┃ 💰 *Layanan* : _Jual Beli Saldo_\n┃ ✅ *Status*  : _Aktif_\n┗━━━━━━━━━━━━━━━━━━━━\n\n' + L + '\n📌 *INFO RESELLER*\n' + L + '\n💵 _Beli & jual saldo lewat reseller terpercaya_\n🚫 _Hati-hati penipuan mengatasnamakan reseller_\n🕐 _Jam Layanan: 08.00 — 24.00 WIB_\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
      await sock.sendMessage(from, { text: txt, mentions: [r1+'@s.whatsapp.net', r2+'@s.whatsapp.net', r3+'@s.whatsapp.net'] }, { quoted: msg })
    }

    // QRIS
    if (text === '.qris' || text === '.qr') {
      const txt = L + '\n💳 *[ GROW BET — PEMBAYARAN QRIS ]* 💳\n' + L + '\n\n🏦 *INFO PEMBAYARAN*\n┏━━━━━━━━━━━━━━━━━━━━\n┃ 🏪 *Merchant* : GROW BET\n┃ 💳 *Metode*   : QRIS (All Payment)\n┃ ✅ *Status*   : _Aktif & Tersedia_\n┗━━━━━━━━━━━━━━━━━━━━\n\n' + L + '\n📋 *CARA PEMBAYARAN*\n' + L + '\n1️⃣ Screenshot / scan QR di atas\n2️⃣ Buka aplikasi e-wallet / m-banking\n3️⃣ Pilih menu *Scan QR / QRIS*\n4️⃣ Masukkan nominal deposit\n5️⃣ Konfirmasi ke Owner / Staff\n\n' + L + '\n💰 *INFO DEPOSIT*\n' + L + '\n💵 *Min Deposit* : Rp 2.000\n🏧 *Diterima*    : _Semua e-wallet & bank_\n⚡ *Proses*      : _Instan & Otomatis_\n\n' + L + '\n⚠️ _Simpan bukti transfer sebelum konfirmasi_\n🕐 _Layanan: 08.00 — 24.00 WIB_\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
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
      const txt = '🎰 *GROW BET BOT* 🎰\n' + L + '\n' + icon + ' *PING RESULT*\n' + L + '\n📡 *Latensi* : *' + ping + ' ms*\n📊 *Sinyal*  : ' + bar + '\n' + speed + ' *Status*  : ' + status + '\n🕐 *Waktu*   : ' + now + '\n' + L + '\n✅ *Bot Online & Siap Melayani!*\n🎯 *Tempat Para Juara* 🏆'
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
        rankTxt += medals[i] + ' @' + num + ' ' + status + '\n     💰 *Rp ' + e.coin.toLocaleString('id-ID') + '*\n     ' + bar + ' ' + (maxCoin > 0 ? Math.round((e.coin/maxCoin)*100) : 0) + '%\n\n'
      }
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '\n🏆 *LEADERBOARD GROW BET* 🏆\n' + L + '\n👑 *Raja Saldo:* @' + rajaNum + '\n💎 *Saldo Teratas:* Rp ' + maxCoin.toLocaleString('id-ID') + '\n' + L + '\n📊 *RANKING SALDO*\n\n' + rankTxt + L + '\n📈 *STATISTIK GRUP*\n👥 Total: *' + entries.length + ' orang*\n✅ Aktif: *' + aktif + ' orang*\n💤 Kosong: *' + kosong + ' orang*\n💵 Total Saldo: *Rp ' + totalSaldo.toLocaleString('id-ID') + '*\n🕒 ' + now + '\n' + L + '\n🔥 _Tingkatkan saldo dengan_ *.deposit*!'
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
        const txt = L + '\n⚠️ *[ REGISTRASI MEMBER ]* ⚠️\n' + L + '\n👤 *Member*  : @' + num + '\n❌ *Status*  : _Sudah terdaftar sebelumnya_\n💰 *Saldo*   : *Rp ' + coin.toLocaleString('id-ID') + '*\n📊 *Akses*   : _Sudah aktif_\n\n' + L + '\n💡 _Gunakan .cs untuk cek saldo_\n\n' + L + '\n🤖 *GrowBetBot — Para Juara* 🏆\n' + L
        await sock.sendMessage(from, { text: txt, mentions: [mentionedJid] }, { quoted: msg })
      } else {
        db[mentionedJid] = { coin: 0, nama: num, terdaftar: new Date().toISOString() }
        saveDB(db)
        const txt = L + '\n✅ *[ REGISTRASI MEMBER ]* ✅\n' + L + '\n👤 *Member*  : @' + num + '\n✅ *Status*  : _Berhasil terdaftar!_\n💰 *Saldo*   : *Rp 0*\n📊 *Akses*   : _Aktif_\n\n' + L + '\n💡 _Gunakan .cs untuk cek saldo_\n\n' + L + '\n🤖 *GrowBetBot — Para Juara* 🏆\n' + L
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
        const daftarBaru = listBaru.length > 0 ? listBaru.map(j => '@' + j.split('@')[0]).join('\n') : '_Semua sudah terdaftar_'
        const txt = L + '\n♔ *[ GROW BET — REGISTRASI MASSAL ]* ♔\n' + L + '\n📊 *Laporan Registrasi Grup*\n' + L + '\n👥 *Total Member*     : *' + meta.participants.length + ' orang*\n✅ *Berhasil Daftar*  : *' + berhasil + ' member*\n⚠️  *Sudah Terdaftar* : *' + sudahAda + ' member*\n\n' + L + '\n📋 *DAFTAR MEMBER BARU*\n' + L + '\n' + daftarBaru + '\n\n' + L + '\n💰 *Saldo Awal*  : Rp 0\n🎯 *Status*      : _Aktif & Siap Bermain!_\n🔒 *Akses*       : _Semua Fitur Bot_\n\n' + L + '\n🏆 _Selamat bergabung di GrowBet!_\n💫 _Semoga selalu hoki & cuan!_ 🍀\n\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
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
      if (!jumlah || isNaN(jumlah) || jumlah <= 0) { await sock.sendMessage(from, { text: '⚠️ Format: *.tss jumlah*\nContoh: *.tss 5k* / *.tss 100k* / *.tss 1jt*' }, { quoted: msg }); return }
      const db = loadDB()
      if (!db[senderJid]) db[senderJid] = { coin: 0, nama: senderJid.split('@')[0], terdaftar: new Date().toISOString() }
      const before = db[senderJid].coin || 0
      db[senderJid].coin = before + jumlah
      const after = db[senderJid].coin
      saveDB(db)
      const num = senderJid.split('@')[0]
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '\n👑 *[ GROW BET — TAMBAH SALDO OWNER ]* 👑\n' + L + '\n\n🎯 *Target*    : @' + num + '\n👑 *Role*      : Owner\n\n' + L + '\n💰 *DETAIL TRANSAKSI*\n' + L + '\n📤 *Saldo Awal* : *Rp ' + before.toLocaleString('id-ID') + '*\n➕ *Ditambah*   : *+Rp ' + jumlah.toLocaleString('id-ID') + '*\n📥 *Saldo Akhir*: *Rp ' + after.toLocaleString('id-ID') + '*\n\n' + L + '\n✅ _Saldo berhasil ditambahkan!_\n🕐 ' + now + '\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
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
      if (!jumlah || isNaN(jumlah) || jumlah <= 0) { await sock.sendMessage(from, { text: '⚠️ Format: *.ts @player jumlah*\nContoh: *.ts @628xxx 5k*' }, { quoted: msg }); return }
      const targetJid = mentionedJid || senderJid
      const db = loadDB()
      if (!db[targetJid]) db[targetJid] = { coin: 0, nama: targetJid.split('@')[0], terdaftar: new Date().toISOString() }
      const before = db[targetJid].coin || 0
      db[targetJid].coin = before + jumlah
      const after = db[targetJid].coin
      saveDB(db)
      const num = targetJid.split('@')[0]
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '\n💎 *[ GROW BET — TAMBAH SALDO ]* 💎\n' + L + '\n\n🎯 *Target*    : @' + num + '\n👑 *Oleh*      : Owner\n\n' + L + '\n💰 *DETAIL TRANSAKSI*\n' + L + '\n📤 *Saldo Awal* : *Rp ' + before.toLocaleString('id-ID') + '*\n➕ *Ditambah*   : *+Rp ' + jumlah.toLocaleString('id-ID') + '*\n📥 *Saldo Akhir*: *Rp ' + after.toLocaleString('id-ID') + '*\n\n' + L + '\n✅ _Saldo berhasil ditambahkan!_\n🕐 ' + now + '\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
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
      if (!jumlah || isNaN(jumlah) || jumlah <= 0) { await sock.sendMessage(from, { text: '⚠️ Format: *.ks @player jumlah*\nContoh: *.ks @628xxx 5k*' }, { quoted: msg }); return }
      const targetJid = mentionedJid || senderJid
      const db = loadDB()
      if (!db[targetJid]) { await sock.sendMessage(from, { text: '❌ Player tidak ditemukan di database!' }, { quoted: msg }); return }
      const before = db[targetJid].coin || 0
      if (jumlah > before) { await sock.sendMessage(from, { text: '⚠️ Saldo tidak cukup!\n💰 Saldo saat ini: *Rp ' + before.toLocaleString('id-ID') + '*' }, { quoted: msg }); return }
      db[targetJid].coin = before - jumlah
      const after = db[targetJid].coin
      saveDB(db)
      const num = targetJid.split('@')[0]
      const pct = before > 0 ? Math.round((after / before) * 10) : 0
      const bar = '▰'.repeat(pct) + '▱'.repeat(10 - pct)
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const txt = L + '\n🔻 *[ GROW BET — KURANGI SALDO ]* 🔻\n' + L + '\n\n🎯 *Target*    : @' + num + '\n👑 *Oleh*      : Owner\n\n' + L + '\n💸 *DETAIL TRANSAKSI*\n' + L + '\n📤 *Saldo Awal* : *Rp ' + before.toLocaleString('id-ID') + '*\n➖ *Dikurangi*  : *-Rp ' + jumlah.toLocaleString('id-ID') + '*\n📥 *Saldo Akhir*: *Rp ' + after.toLocaleString('id-ID') + '*\n📊 *Sisa Saldo* : ' + bar + ' ' + (before > 0 ? Math.round((after/before)*100) : 0) + '%\n\n' + L + '\n✅ _Saldo berhasil dikurangi!_\n🕐 ' + now + '\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
      const mList = mentionedJid ? [mentionedJid] : [senderJid]
      await sock.sendMessage(from, { text: txt, mentions: mList }, { quoted: msg })
    }

    // TRANSFER SALDO
    if (text.startsWith('.tf')) {
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      if (!mentionedJid) { await sock.sendMessage(from, { text: '⚠️ Format: *.tf @player jumlah*\nContoh: *.tf @628xxx 5k*' }, { quoted: msg }); return }
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
      const isFreeTax = resellers.includes(senderJid) || isOwner
      const tax = isFreeTax ? 0 : Math.floor(jumlah * 0.03)
      const totalKurang = jumlah + tax
      if (saldoPengirim < totalKurang) { await sock.sendMessage(from, { text: '❌ Saldo tidak cukup!\n💰 Saldo kamu: *Rp ' + saldoPengirim.toLocaleString('id-ID') + '*\n💸 Butuh: *Rp ' + totalKurang.toLocaleString('id-ID') + '*' }, { quoted: msg }); return }
      db[senderJid].coin = saldoPengirim - totalKurang
      db[mentionedJid].coin = (db[mentionedJid].coin || 0) + jumlah
      saveDB(db)
      const numFrom = senderJid.split('@')[0]
      const numTo = mentionedJid.split('@')[0]
      const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      const taxInfo = isFreeTax ? '🎖️ *Tax*        : *FREE (Reseller/Owner)*' : '💸 *Tax 3%*     : *-Rp ' + tax.toLocaleString('id-ID') + '*'
      const txt = L + '\n💸 *[ GROW BET — TRANSFER SALDO ]* 💸\n' + L + '\n\n📤 *Pengirim* : @' + numFrom + '\n📥 *Penerima* : @' + numTo + '\n\n' + L + '\n💰 *DETAIL TRANSAKSI*\n' + L + '\n💵 *Transfer*      : *Rp ' + jumlah.toLocaleString('id-ID') + '*\n' + taxInfo + '\n💳 *Total Potong*  : *Rp ' + totalKurang.toLocaleString('id-ID') + '*\n\n' + L + '\n📊 *SALDO SETELAH TF*\n' + L + '\n📤 @' + numFrom + ' : *Rp ' + db[senderJid].coin.toLocaleString('id-ID') + '*\n📥 @' + numTo + '   : *Rp ' + db[mentionedJid].coin.toLocaleString('id-ID') + '*\n\n' + L + '\n✅ _Transfer berhasil!_\n🕐 ' + now + '\n' + L + '\n🤖 *GrowBetBot — Tempat Para Juara* 🏆\n' + L
      await sock.sendMessage(from, { text: txt, mentions: [senderJid, mentionedJid] }, { quoted: msg })
    }

  })
}

startBot()
