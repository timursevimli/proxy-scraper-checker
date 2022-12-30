if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed"
    exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed"
fi

set container_name=proxy-db

docker-compose up -d

:wait_for_container
docker exec %container_name% which pg_isready
if errorlevel 1 (
  echo waiting for proxy-db container to start
  timeout /t 2 >nul
  goto wait_for_container
)

if not exist "node_modules" (
  npm install
)

npm start