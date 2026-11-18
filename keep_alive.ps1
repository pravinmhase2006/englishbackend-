# SpeakUp Cloud Server Keep-Alive Daemon
# Sends a lightweight health check to keep the Render server from spinning down.
param(
    [string]$Url = "https://speakup-ai-backend-ltus.onrender.com/health",
    [int]$IntervalMinutes = 10
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   SpeakUp Server Keep-Alive Daemon Active   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Target: $Url"
Write-Host "Interval: Every $IntervalMinutes minutes`n"

while ($true) {
    try {
        $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 15
        Write-Host "[$timestamp] Server Online - Status: $($response.status), DB: $($response.database)" -ForegroundColor Green
    } catch {
        Write-Host "[$timestamp] Ping failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}
