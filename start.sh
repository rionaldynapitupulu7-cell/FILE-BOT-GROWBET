#!/bin/bash
while true; do
  node index.js
  echo "Bot mati, restart dalam 3 detik..."
  git add -A
  git commit -m "auto save $(date '+%Y-%m-%d %H:%M:%S')"
  git push origin main
  sleep 3
done
