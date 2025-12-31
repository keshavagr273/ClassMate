Write-Host "🚀 ClassMate Performance Test" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check server
try {
    Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 2 | Out-Null
    Write-Host "✅ Server running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not running" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📊 Running 50 requests..." -ForegroundColor Yellow

# Make requests
for ($i = 1; $i -le 50; $i++) {
    Invoke-WebRequest -Uri "http://localhost:5000/api/users/health" -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    Write-Progress -Activity "Testing" -PercentComplete ($i * 2)
    Start-Sleep -Milliseconds 50
}

Write-Host "✅ Complete!" -ForegroundColor Green
Write-Host ""

# Get metrics
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/metrics"
$m = $response.data

Write-Host "═══════════════════════════════" -ForegroundColor Cyan
Write-Host "  PERFORMANCE METRICS" -ForegroundColor White
Write-Host "═══════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  Uptime:         $($m.uptime)" -ForegroundColor White
Write-Host "📊 Requests:       $($m.totalRequests)" -ForegroundColor White
Write-Host "⚡ Avg Time:       $($m.avgResponseTime)" -ForegroundColor Green
Write-Host "🔄 Per Minute:     $($m.requestsPerMinute)" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($m.topEndpoints.Count -gt 0) {
    Write-Host "TOP ENDPOINTS:" -ForegroundColor Yellow
    foreach ($e in $m.topEndpoints) {
        Write-Host "  $($e.endpoint): $($e.avgTime)ms avg ($($e.requests) req)" -ForegroundColor Gray
    }
}

Write-Host ""
$avgNum = [int]($m.avgResponseTime -replace 'ms', '')
if ($avgNum -lt 100) {
    Write-Host "🎯 Your API: Sub-${avgNum}ms response time!" -ForegroundColor Green
    Write-Host "   Ready for resume! ✅" -ForegroundColor Green
}
