#!/bin/bash

current_version=$(node -v)
allowed_major_versions=("18" "20")
major_version=${current_version#"v"}
if [[ " ${allowed_major_versions[@]} " =~ " ${major_version%%.*} " ]]; then
  npm start
else
    echo "Use Node.js version ^18 or ^20. Current version is ${current_version}."
    exit 1
fi
