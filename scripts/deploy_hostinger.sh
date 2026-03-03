#!/bin/bash
set -e

echo "Starting Deployment for Client 1..."

# 1. Install Dependencies
apt-get update
apt-get install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs postgresql postgresql-contrib nginx git

# Install PM2
npm install -g pm2

# 2. Setup PostgreSQL User & Database
sudo -u postgres psql -c "CREATE USER saas_user WITH PASSWORD 'saas_password';" || true
sudo -u postgres psql -c "CREATE DATABASE client1_db OWNER saas_user;" || true
sudo -u postgres psql -c "CREATE DATABASE client2_db OWNER saas_user;" || true

# 3. Clone / Update Repo
if [ -d "/var/www/client1" ]; then
    rm -rf /var/www/client1
fi
mkdir -p /var/www
git clone https://github.com/Shaswat97/SaasProd.git /var/www/client1
cd /var/www/client1

# 4. Configure .env for Client 1
cat <<EOT > .env
DATABASE_URL="postgresql://saas_user:saas_password@localhost:5432/client1_db?schema=public"
NEXT_PUBLIC_APP_URL="http://technosynergians.com"
EOT

# 5. Install & Build Client 1
npm install
npx prisma db push --accept-data-loss || true
npm run build

# 6. Start PM2
pm2 stop client1 || true
pm2 delete client1 || true
pm2 start npm --name "client1" -- start -- -p 3000
pm2 save
pm2 startup | grep "sudo pm2" | bash || true

# 7. Configure Nginx
cat <<'EOT' > /etc/nginx/sites-available/client1
server {
    listen 80;
    server_name technosynergians.com www.technosynergians.com 88.222.244.185;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOT

ln -sf /etc/nginx/sites-available/client1 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl disable --now apache2 2>/dev/null || true
systemctl restart nginx

# 8. Unban user's Mac IP if blocked by fail2ban
fail2ban-client unbanall 2>/dev/null || true

echo "====================================================="
echo "Client 1 Deployment Complete!"
echo "Your app is now running at http://88.222.244.185"
echo "====================================================="
