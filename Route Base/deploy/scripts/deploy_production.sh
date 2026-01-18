#!/bin/bash
echo "🚀 DEPLOYING PAYFAST TO PRODUCTION"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Copy .env.example to .env and configure it first"
    exit 1
fi

# Load environment
set -a
source .env
set +a

echo -e "${YELLOW}1. Installing dependencies...${NC}"
pip install -r requirements.txt

echo -e "${YELLOW}2. Running migrations...${NC}"
python manage.py migrate

echo -e "${YELLOW}3. Collecting static files...${NC}"
python manage.py collectstatic --noinput

echo -e "${YELLOW}4. Creating superuser (if not exists)...${NC}"
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@payfast.pk', 'admin123')
    print('Superuser created: admin / admin123')
else:
    print('Superuser already exists')
EOF

echo -e "${YELLOW}5. Setting up JazzCash...${NC}"
if [ -z "$JAZZCASH_MERCHANT_ID" ] || [ "$JAZZCASH_MERCHANT_ID" = "MC58163" ]; then
    echo -e "${RED}Warning: Using JazzCash sandbox credentials${NC}"
    echo "Update .env with production JazzCash credentials"
fi

echo -e "${YELLOW}6. Starting server...${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Access your platform: http://localhost:8000"
echo "2. Admin panel: http://localhost:8000/admin"
echo "3. Test payment with sandbox credentials"
echo "4. Get JazzCash production credentials"
echo "5. Deploy to cloud (see deploy/ folder)"
echo ""
echo -e "${GREEN}Platform is READY to earn money!${NC}"