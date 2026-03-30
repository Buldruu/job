#!/bin/bash
# GitHub Secrets автоматаар тохируулах скрипт
# Ашиглах: bash set-secrets.sh
# Урьдчилсан нөхцөл: gh CLI суулгасан, gh auth login хийсэн байх

REPO="Buldruu/job"

echo "GitHub Secrets тохируулж байна: $REPO"

gh secret set VITE_FIREBASE_API_KEY           --body "AIzaSyAf42ijDzYJEh0cC8-L-6AoVTws49yXQI4"          --repo $REPO
gh secret set VITE_FIREBASE_AUTH_DOMAIN       --body "jobhub-c671c.firebaseapp.com"                      --repo $REPO
gh secret set VITE_FIREBASE_PROJECT_ID        --body "jobhub-c671c"                                      --repo $REPO
gh secret set VITE_FIREBASE_STORAGE_BUCKET    --body "jobhub-c671c.firebasestorage.app"                  --repo $REPO
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "629971119042"                                    --repo $REPO
gh secret set VITE_FIREBASE_APP_ID            --body "1:629971119042:web:f8d0a5626f0c810a2e445b"         --repo $REPO

echo "✅ Бүх secrets амжилттай тохируулагдлаа!"
echo "🚀 https://github.com/$REPO/actions дээр build явж байгааг шалгана уу"
