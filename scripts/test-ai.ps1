$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    prompt = "你好，请介绍一下自己"
    options = @{
        model = "qwen3.6-plus"
        enableThinking = $true
    }
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/chat" -Method Post -Headers $headers -Body $body

$response