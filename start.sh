#!/bin/bash

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed"
    exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed"
fi

container_name=proxy-db

docker-compose up -d

while ! docker exec $container_name which pg_isready
do
  printf "\r$(date) - waiting for proxy-db container to start"
  sleep 2
done

if [ ! -d "node_modules" ]; then
  npm install
fi

npm start