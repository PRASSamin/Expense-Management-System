#!/usr/bin/env bash
set -o errexit

npm install --legacy-peer-deps
npm run build