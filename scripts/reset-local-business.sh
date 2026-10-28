#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
mode="${1:---preview}"
if [[ "$mode" != '--preview' && "$mode" != '--execute' ]]; then
  echo 'Usage: bash scripts/reset-local-business.sh --preview|--execute' >&2
  exit 2
fi
services=(auth_service customer_service driver_service booking_service trip_service payment_service notification_service rating_service)
echo 'Scope: business documents in 8 owner DBs, CAB queues and cab:rate:* only.'
for service in "${services[@]}"; do
  docker compose run --rm --no-deps "$service" node scripts/reset-business.cjs "$service" --preview
done
docker compose run --rm --no-deps auth_service node scripts/reset-business-queues.cjs --preview
docker compose run --rm --no-deps gateway node scripts/reset-business-rates.cjs --preview
if [[ "$mode" == '--preview' ]]; then
  echo 'Preview complete. Nothing deleted.'
  exit 0
fi
echo 'Executing the explicitly selected reset. All CAB business documents will be removed.'
docker compose stop gateway "${services[@]}"
docker compose run --rm --no-deps auth_service node scripts/reset-business-queues.cjs --execute
for service in "${services[@]}"; do
  docker compose run --rm --no-deps "$service" node scripts/reset-business.cjs "$service" --execute
done
docker compose run --rm --no-deps gateway node scripts/reset-business-rates.cjs --execute
echo 'Reset complete. Apps remain stopped; accounts were not reseeded.'
echo 'MongoDB users, ownership metadata, indexes, volumes and secrets were preserved.'
