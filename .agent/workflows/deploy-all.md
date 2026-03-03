---
description: How to deploy code changes to all VPS tenants
---

// turbo-all

## Deploy to All Environments + Clients

1. Push your changes from your Mac:
```bash
cd ~/Desktop/SaasProd/SaasProd
git add . && git commit -m "your message" && git push origin main
```

2. Promote to staging (if ready):
```bash
git checkout staging && git merge main && git push origin staging && git checkout main
```

3. Promote to prod (if releasing):
```bash
git checkout prod && git merge staging && git push origin prod && git checkout main
```

4. On VPS Web Terminal, deploy all:
```bash
for d in $(ls /var/www/ | grep -v html); do cd /var/www/$d && git pull && npm run build && pm2 restart $d; done
```

5. Verify all sites are working by checking PM2 status:
```bash
pm2 status
```
