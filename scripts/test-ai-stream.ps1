$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    prompt = "请详细解释一下什么是人工智能"
    options = @{
        model = "qwen3.6-plus"
        enableThinking = $true
    }
} | ConvertTo-Json

Write-Host "测试流式聊天 API..." -ForegroundColor Green
Write-Host "请求发送中..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/chat" -Method Post -Headers $headers -Body $body -TimeoutSec 60

    Write-Host "`nAI 回复:" -ForegroundColor Cyan
    Write-Host $response.data.response -ForegroundColor White
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}