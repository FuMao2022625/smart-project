Write-Host "检查 AI 服务状态..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/status" -Method Get -TimeoutSec 10

    Write-Host "`nAI 服务状态:" -ForegroundColor Cyan
    Write-Host "初始化状态: $($response.data.status.initialized)" -ForegroundColor White
    Write-Host "就绪状态: $($response.data.status.ready)" -ForegroundColor White
    Write-Host "服务运行中: $($response.success)" -ForegroundColor Green
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
    Write-Host "请确保应用已启动 (npm start)" -ForegroundColor Yellow
}