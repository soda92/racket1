#!/bin/bash

# Configuration
SERVER="elegant-post-3"
REMOTE_PATH="/var/www/html/slide" # Update this to your actual server path

echo "🚀 Building project..."
npm run build

echo "📦 Transferring files to $SERVER..."
# Create the directory on the server if it doesn't exist
ssh $SERVER "mkdir -p $REMOTE_PATH"

# Sync the dist folder to the server
# -r: recursive, -P: show progress
scp -r dist/* $SERVER:$REMOTE_PATH

echo "✅ Deployment complete! Visit https://your-domain.com/slide/"
