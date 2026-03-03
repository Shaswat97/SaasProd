#!/bin/bash
# Helper script to connect to VPS databases via SSH tunnel

echo "Select environment:"
echo "1) Main"
echo "2) Staging"
echo "3) Prod"
read -p "Enter choice [1-3]: " choice

case $choice in
    1) DB="main_db" ;;
    2) DB="staging_db" ;;
    3) DB="prod_db" ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

read -p "Enter VPS IP (e.g. 195.35.39.239): " VPS_IP

echo "Establishing SSH tunnel to $VPS_IP for database: $DB..."
echo "You can now connect your database tool (TablePlus/DBeaver) to:"
echo "----------------------------------------"
echo "Host     : localhost"
echo "Port     : 5433"
echo "Database : $DB"
echo "User     : saas_user"
echo "Password : saas_password"
echo "----------------------------------------"
echo "Press Ctrl+C to close the connection tunnel when finished."
echo ""

ssh -L 5433:localhost:5432 root@$VPS_IP
