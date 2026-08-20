#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd -- "$SCRIPT_DIR/.." && pwd)}"
COMPOSE_FILE="$APP_DIR/deploy/docker-compose.yml"
IMAGE_NAME="${IMAGE_NAME:-ghcr.io/huangwenxuangod/dujiao-next}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
GHCR_USERNAME="${GHCR_USERNAME:-}"
GHCR_TOKEN="${GHCR_TOKEN:-}"

cd "$APP_DIR"
test -s .env || { echo "missing $APP_DIR/.env" >&2; exit 1; }
test -s config.yml || { echo "missing $APP_DIR/config.yml" >&2; exit 1; }

mkdir -p db uploads logs
chmod 750 db uploads logs

export IMAGE_NAME IMAGE_TAG
if [[ -n "$GHCR_USERNAME" && -n "$GHCR_TOKEN" ]]; then
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin >/dev/null
fi
docker compose -f "$COMPOSE_FILE" pull app
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans app

for attempt in $(seq 1 30); do
  state="$(docker inspect --format '{{.State.Health.Status}}' dujiao-next 2>/dev/null || true)"
  if [[ "$state" == "healthy" ]]; then
    echo "dujiao-next healthy: ${IMAGE_NAME}:${IMAGE_TAG}"
    exit 0
  fi
  if [[ "$state" == "unhealthy" || "$state" == "" ]]; then
    docker compose -f "$COMPOSE_FILE" ps
    docker compose -f "$COMPOSE_FILE" logs --tail=100 app
    exit 1
  fi
  sleep 2
done

docker compose -f "$COMPOSE_FILE" ps
docker compose -f "$COMPOSE_FILE" logs --tail=100 app
exit 1
