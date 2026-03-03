#!/bin/bash
set -e

###############################################################################
#  Add a new client tenant to the VPS
#  ───────────────────────────────────
#  Clones from the 'prod' branch, creates a separate DB, PM2 process, and
#  Nginx config.
#
#  Usage:  bash /var/www/prod/scripts/add-client.sh <company_name> <port>
#  Example: bash /var/www/prod/scripts/add-client.sh tatasteel 3003
###############################################################################

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: bash add-client.sh <company_name> <port>"
  echo "Example: bash add-client.sh tatasteel 3003"
  echo ""
  echo "Current ports in use:"
  pm2 jlist 2>/dev/null | grep -o '"port [0-9]*"' || pm2 status
  exit 1
fi

COMPANY="$1"
PORT="$2"
REPO="https://github.com/Shaswat97/SaasProd.git"
DB_USER="saas_user"
DB_PASS="saas_password"
DB_NAME="${COMPANY}_db"
DOMAIN="${COMPANY}.technosynergians.com"
APP_DIR="/var/www/${COMPANY}"

echo "============================================="
echo "  Adding Client: ${COMPANY}"
echo "  Domain:  ${DOMAIN}"
echo "  Port:    ${PORT}"
echo "  DB:      ${DB_NAME}"
echo "  Dir:     ${APP_DIR}"
echo "  Branch:  prod"
echo "============================================="

# Check if directory already exists
if [ -d "${APP_DIR}" ]; then
  echo "ERROR: ${APP_DIR} already exists. Remove it first:"
  echo "  pm2 delete ${COMPANY} && rm -rf ${APP_DIR}"
  exit 1
fi

# Check if port is in use
if pm2 jlist 2>/dev/null | grep -q "\"port\":${PORT}"; then
  echo "ERROR: Port ${PORT} is already in use. Pick a different port."
  exit 1
fi

# Step 1: Create database
echo ""
echo ">>> Creating database: ${DB_NAME}..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_catalog.pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
echo "    ✓ Database ready"

# Step 2: Clone from prod branch
echo ""
echo ">>> Cloning prod branch..."
git clone --depth 1 --branch prod "${REPO}" "${APP_DIR}" > /dev/null 2>&1
cd "${APP_DIR}"
echo "    ✓ Cloned"

# Step 3: Create .env
cat > .env <<EOT
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
NEXT_PUBLIC_APP_URL="http://${DOMAIN}"
EOT
echo "    ✓ .env created"

# Step 4: Install, push schema, seed, build
echo ""
echo ">>> Installing dependencies..."
npm install > /dev/null 2>&1
echo "    ✓ npm install"

npx prisma generate > /dev/null 2>&1
npx prisma db push --accept-data-loss > /dev/null 2>&1
echo "    ✓ Prisma schema pushed"

node scripts/create-admin-users.js 2>&1 | sed 's/^/    /'

npm run build > /dev/null 2>&1
echo "    ✓ Built"

# Step 5: Start PM2
pm2 start npm --name "${COMPANY}" -- start -- -p "${PORT}"
pm2 save
echo "    ✓ PM2 started"

# Step 6: Nginx config
cat > "/etc/nginx/sites-available/${COMPANY}" <<EOT
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
ln -sf "/etc/nginx/sites-available/${COMPANY}" /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "    ✓ Nginx configured"

echo ""
echo "============================================="
echo "  Client ${COMPANY} deployed!"
echo "  URL:   http://${DOMAIN}"
echo "  Login: Techno / kundanrajesh"
echo "============================================="
echo ""
echo "  REMINDER: Add a DNS A record in Hostinger:"
echo "  Name: ${COMPANY}  →  Points to: $(curl -s ifconfig.me 2>/dev/null || echo '88.222.244.185')"
echo "============================================="
