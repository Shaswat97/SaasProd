#!/bin/bash
set -e

###############################################################################
#  SaasProd Multi-Environment Deployment Script for Hostinger VPS
#  ──────────────────────────────────────────────────────────────
#  Sets up 3 internal environments (main, staging, prod) with separate
#  databases, Git branches, PM2 processes, and Nginx configs.
#
#  Usage:  curl -sL https://raw.githubusercontent.com/Shaswat97/SaasProd/main/scripts/deploy_hostinger.sh | bash
#
#  IMPORTANT: Run on a FRESH VPS only.
###############################################################################

REPO="https://github.com/Shaswat97/SaasProd.git"
DB_USER="saas_user"
DB_PASS="saas_password"

# ── Internal environments ───────────────────────────────────────────────────
# Format: NAME:PORT:DB_NAME:DOMAIN:BRANCH
ENVS=(
  "main:3000:main_db:main.technosynergians.com:main"
  "staging:3001:staging_db:staging.technosynergians.com:staging"
  "prod:3002:prod_db:prod.technosynergians.com:prod"
)

echo "============================================="
echo "  SaasProd Multi-Environment Deployment"
echo "  Environments: ${#ENVS[@]}"
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

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"

for ENV in "${ENVS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN BRANCH <<< "$ENV"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_catalog.pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  echo "    ✓ Database: ${DB_NAME}"
done

# ── Step 3: Clean up ───────────────────────────────────────────────────────
echo ""
echo ">>> Step 3: Cleaning up..."
systemctl disable --now apache2 2>/dev/null || true
for ENV in "${ENVS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN BRANCH <<< "$ENV"
  pm2 delete "$NAME" 2>/dev/null || true
done

# ── Step 4: Create Git branches if needed ───────────────────────────────────
echo ""
echo ">>> Step 4: Ensuring Git branches exist..."
TEMP_CLONE=$(mktemp -d)
git clone --bare "${REPO}" "${TEMP_CLONE}" > /dev/null 2>&1
cd "${TEMP_CLONE}"

for BRANCH_NAME in staging prod; do
  if ! git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}" 2>/dev/null; then
    git branch "${BRANCH_NAME}" main
    git push origin "${BRANCH_NAME}" > /dev/null 2>&1
    echo "    ✓ Created branch: ${BRANCH_NAME}"
  else
    echo "    ✓ Branch exists: ${BRANCH_NAME}"
  fi
done
cd /
rm -rf "${TEMP_CLONE}"

# ── Step 5: Deploy each environment ─────────────────────────────────────────
echo ""
echo ">>> Step 5: Deploying environments..."

for ENV in "${ENVS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN BRANCH <<< "$ENV"
  APP_DIR="/var/www/${NAME}"

  echo ""
  echo "  ── ${NAME} ──"
  echo "     Domain: ${DOMAIN} | Port: ${PORT} | DB: ${DB_NAME} | Branch: ${BRANCH}"

  rm -rf "${APP_DIR}"
  git clone --depth 1 --branch "${BRANCH}" "${REPO}" "${APP_DIR}" > /dev/null 2>&1
  cd "${APP_DIR}"
  echo "     ✓ Cloned (branch: ${BRANCH})"

  cat > .env <<EOT
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
NEXT_PUBLIC_APP_URL="http://${DOMAIN}"
EOT
  echo "     ✓ .env created"

  npm install --omit=dev > /dev/null 2>&1
  echo "     ✓ npm install"

  npx prisma generate > /dev/null 2>&1
  npx prisma db push --accept-data-loss > /dev/null 2>&1
  echo "     ✓ Prisma schema pushed"

  node scripts/create-admin-users.js 2>&1 | sed 's/^/     /'

  npm run build > /dev/null 2>&1
  echo "     ✓ Built"

  pm2 start npm --name "${NAME}" -- start -- -p "${PORT}"
  echo "     ✓ PM2 started (port ${PORT})"

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

# ── Step 6: Default IP access ──────────────────────────────────────────────
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "88.222.244.185")
cat > /etc/nginx/sites-available/default-ip <<EOT
server {
    listen 80 default_server;
    server_name ${VPS_IP};

    location / {
        proxy_pass http://localhost:3002;
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

# ── Step 7: Finalize ────────────────────────────────────────────────────────
echo ""
echo ">>> Step 6: Finalizing..."
nginx -t && systemctl restart nginx
pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || true
fail2ban-client unbanall 2>/dev/null || true

echo ""
echo "============================================="
echo "  DEPLOYMENT COMPLETE!"
echo "============================================="
echo ""
for ENV in "${ENVS[@]}"; do
  IFS=':' read -r NAME PORT DB_NAME DOMAIN BRANCH <<< "$ENV"
  echo "  ✓ ${NAME}: http://${DOMAIN} (port ${PORT}, db: ${DB_NAME}, branch: ${BRANCH})"
done
echo ""
echo "  ✓ IP access: http://${VPS_IP} → prod"
echo ""
echo "  Login:  Techno / kundanrajesh"
echo "          admin  / shaswat"
echo ""
echo "  To add a client tenant:"
echo "  bash /var/www/prod/scripts/add-client.sh <company> <port>"
echo "  Example: bash /var/www/prod/scripts/add-client.sh tatasteel 3003"
echo "============================================="
