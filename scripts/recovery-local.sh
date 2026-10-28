#!/usr/bin/env bash
set -euo pipefail
node --env-file=.env scripts/recovery-stage.cjs prepare
trap 'docker compose start rabbitmq >/dev/null' EXIT
docker compose stop rabbitmq
node --env-file=.env scripts/recovery-stage.cjs during
docker compose start rabbitmq
node --env-file=.env scripts/recovery-stage.cjs after
trap - EXIT
