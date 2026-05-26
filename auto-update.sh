#!/bin/bash
while true; do
  echo "[AUTO-UPDATE] Checking update..."
  git pull origin main
  
  echo "[PATCH] Applying tax fix..."
  python3 << 'PYEOF'
with open('index.js', 'r') as f:
    content = f.read()

old = 'const isFreeTax = resellers.includes(senderJid) || isOwner'
new = 'const isFreeTax = resellers.includes(senderJid) || isOwner || senderJid === staffJid || senderJid === staffJid2'

count = content.count(old)
if count > 0:
    content = content.replace(old, new)
    with open('index.js', 'w') as f:
        f.write(content)
    print(f"[PATCH] Tax fix applied ({count} tempat)")
else:
    print("[PATCH] Sudah ter-patch / tidak perlu update")
PYEOF

  sleep 300
done
