#!/bin/bash

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed"
    exit 1
fi

if [ ! -d "node_modules" ]; then
  npm install
fi

npm start