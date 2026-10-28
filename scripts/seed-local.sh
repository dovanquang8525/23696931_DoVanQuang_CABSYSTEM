#!/usr/bin/env bash
set -euo pipefail
# Compose reads SEED_PASSWORD from .env and injects only the Auth seed command.
if [[ "${1:-}" != '--fixtures' ]]; then
  if [[ -n "${1:-}" ]]; then echo 'Usage: bash scripts/seed-local.sh [--fixtures]' >&2; exit 2; fi
  echo 'Seeding ADMIN only; no Customer or Driver accounts will be created.'
  docker compose exec -T auth_service node scripts/seed.cjs auth_service --admin-only
  exit 0
fi
echo 'Seeding Auth accounts...'
docker compose exec -T auth_service node scripts/seed.cjs auth_service
echo 'Seeding Driver profiles and vehicles...'
docker compose exec -T driver_service node scripts/seed.cjs driver_service
echo 'Seeding Booking history...'
docker compose exec -T booking_service node scripts/seed.cjs booking_service
echo 'Seed ready. Phones: admin 0909000000; customers 0909000001/2; drivers 0909000011..15.'
echo 'Login uses email: admin@cab.local; fixture.c1@cab.local / fixture.c2@cab.local; fixture.d1@cab.local .. fixture.d5@cab.local.'
echo 'Password is SEED_PASSWORD in your local .env; no secret was printed.'
