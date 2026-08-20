#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/data/wwwroot/dujiao-next}"
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
docker compose -f deploy/docker-compose.yml pull app
docker compose -f deploy/docker-compose.yml up -d --remove-orphans app

for attempt in $(seq 1 30); do
  state="$(docker inspect --format '{{.State.Health.Status}}' dujiao-next 2>/dev/null || true)"
  if [[ "$state" == "healthy" ]]; then
    echo "dujiao-next healthy: ${IMAGE_NAME}:${IMAGE_TAG}"
    exit 0
  fi
  if [[ "$state" == "unhealthy" || "$state" == "" ]]; then
    docker compose -f deploy/docker-compose.yml ps
    docker compose -f deploy/docker-compose.yml logs --tail=100 app
    exit 1
  fi
  sleep 2
done

docker compose -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml logs --tail=100 app
exit 1
