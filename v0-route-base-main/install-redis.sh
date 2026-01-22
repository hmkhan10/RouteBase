#!/bin/bash

# Redis Installation Script for Ubuntu/Debian
echo "Installing Redis for RouteBase Platform..."

# Update package list
sudo apt update

# Install Redis server
sudo apt install -y redis-server

# Start Redis service
sudo systemctl start redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

echo "Redis installation completed!"
echo "Redis is running on localhost:6379"
echo "You can configure Redis settings in /etc/redis/redis.conf"
