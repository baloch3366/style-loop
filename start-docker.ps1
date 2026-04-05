Write-Host "🚀 Starting Docker development environment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Build and start
Write-Host "🐳 Building Docker image..." -ForegroundColor Cyan
docker-compose build

Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
docker-compose up