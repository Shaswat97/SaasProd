#!/bin/bash
set -e

###############################################################################
#  SaasProd Multi-Tenant Deployment Script for Hostinger VPS
#  ---------------------------------------------------------
#  This script sets up MULTIPLE isolated tenants on a single VPS.
#  Each tenant gets: its own folder, database, PM2 process, and Nginx config.
#
#  Usage:  curl -sL https://raw.githubusercontent.com/Shaswat97/SaasProd/main/scripts/deploy_hostinger.sh | bash
#
#  IMPORTANT: Run this on a FRESH VPS only. It will overwrite existing configs.
###############################################################################

REPO="https://github.com/Shaswat97/SaasProd.git"
DB_USER="saas_user"
DB_PASS="saas_password"

# ── Define tenants ──────────────────────────────────────────────────────────
# Format: NAME:PORT:DB_NAME:DOMAIN
TENANTS=(
  "client1:3000:client1_db:staging.technosynergians.com"
  "client2:3001:client2_db:test.technosynergians.com"
)

echo "============================================="
echo "  SaasProd Multi-Tenant Deployment"
echo "  Tenants: ${#TENANTS[@]}"
echo "============================================="

# ── Step 1: Install system dependencies ─────────────────────────────────────
echo ""
echo ">>> Step 1: Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq curl git nginx postgresql postgresql-contrib > /dev/null

# Install Node.js 18
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null
fi
echo "    Node: $(node -v) | npm: $(npm -v)"

# Install PM2
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2 > /dev/null 2>&1
fi
echo "    PM2: $(pm2 -v)"

# ── Step 2: Setup PostgreSQL ────────────────────────────────────────────────
echo ""
echo ">>> Step 2: Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql > /dev/null 2>&1

# Create shared DB user
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"

# Create databases for each tenant
for TENANT in "${TENANTS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN <<< "$TENANT"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_catalog.pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  echo "    ✓ Database: ${DB_NAME}"
done

# ── Step 3: Stop existing services ─────────────────────────────────────────
echo ""
echo ">>> Step 3: Cleaning up existing services..."
systemctl disable --now apache2 2>/dev/null || true
for TENANT in "${TENANTS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN <<< "$TENANT"
  pm2 delete "$NAME" 2>/dev/null || true
done

# ── Step 4: Deploy each tenant ──────────────────────────────────────────────
echo ""
echo ">>> Step 4: Deploying tenants..."

for TENANT in "${TENANTS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN <<< "$TENANT"
  APP_DIR="/var/www/${NAME}"
  
  echo ""
  echo "  ── Tenant: ${NAME} ──"
  echo "     Domain: ${DOMAIN}"
  echo "     Port:   ${PORT}"
  echo "     DB:     ${DB_NAME}"
  echo "     Dir:    ${APP_DIR}"
  
  # Clone fresh
  rm -rf "${APP_DIR}"
  git clone --depth 1 "${REPO}" "${APP_DIR}" > /dev/null 2>&1
  cd "${APP_DIR}"
  echo "     ✓ Cloned"
  
  # Create .env with UNIQUE database
  cat > .env <<EOT
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
NEXT_PUBLIC_APP_URL="http://${DOMAIN}"
EOT
  echo "     ✓ .env created (DB=${DB_NAME})"
  
  # Install & build
  npm install --omit=dev > /dev/null 2>&1
  echo "     ✓ npm install done"
  
  npx prisma generate > /dev/null 2>&1
  npx prisma db push --accept-data-loss > /dev/null 2>&1
  echo "     ✓ Prisma schema pushed"
  
  # Seed admin users
  node scripts/create-admin-users.js 2>&1 | sed 's/^/     /'
  
  # Build
  npm run build > /dev/null 2>&1
  echo "     ✓ Next.js built"
  
  # Start PM2 on unique port
  pm2 start npm --name "${NAME}" -- start -- -p "${PORT}"
  echo "     ✓ PM2 started on port ${PORT}"
  
  # Create Nginx server block
  cat > "/etc/nginx/sites-available/${NAME}" <<EOT
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOT
  ln -sf "/etc/nginx/sites-available/${NAME}" /etc/nginx/sites-enabled/
  echo "     ✓ Nginx configured"
done

# ── Step 5: Also serve the IP address via client1 ──────────────────────────
# Add the VPS IP as a server_name for client1 so you can access it by IP
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "88.222.244.185")
cat > /etc/nginx/sites-available/default-ip <<EOT
server {
    listen 80 default_server;
    server_name ${VPS_IP};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOT
ln -sf /etc/nginx/sites-available/default-ip /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# ── Step 6: Finalize ────────────────────────────────────────────────────────
echo ""
echo ">>> Step 5: Finalizing..."
nginx -t && systemctl restart nginx
pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || true
fail2ban-client unbanall 2>/dev/null || true

echo ""
echo "============================================="
echo "  DEPLOYMENT COMPLETE!"
echo "============================================="
echo ""
for TENANT in "${TENANTS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN <<< "$TENANT"
  echo "  ✓ ${NAME}: http://${DOMAIN} (port ${PORT}, db: ${DB_NAME})"
done
echo ""
echo "  ✓ IP access: http://${VPS_IP} → client1"
echo ""
echo "  Login: Techno / kundanrajesh"
echo "         admin  / shaswat"
echo "============================================="
