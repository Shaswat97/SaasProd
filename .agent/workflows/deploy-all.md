---
description: How to deploy code changes to all VPS tenants
---

// turbo-all

## Deploy to All Tenants

1. Push your changes to GitHub:
```bash
git add . && git commit -m "your message" && git push origin main
```

2. Open the Hostinger Web Terminal and run:
```bash
for d in client1 client2; do cd /var/www/$d && git pull && npm run build && pm2 restart $d; done
```

3. Verify both sites are working:
   - staging.technosynergians.com
   - test.technosynergians.com
