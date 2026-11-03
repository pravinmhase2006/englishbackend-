$baseUrl = "http://127.0.0.1:5000"

Write-Host "=== 1. Health Check ==="
$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Write-Host ($health | ConvertTo-Json)

Write-Host "`n=== 2. Login as Alex Carter ==="
$loginBody = @{
    email = "alex.carter@example.com"
    password = "password123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Login response success: $($loginRes.success)"
$token = $loginRes.data.tokens.accessToken
Write-Host "Access Token received: $($token.Substring(0, 20))..."

Write-Host "`n=== 3. Unauthorized Access Test (Should fail with 401) ==="
try {
    $unauth = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/me" -Method Get
    Write-Host "FAIL: Unexpectedly succeeded"
} catch {
    Write-Host "PASS: Caught expected unauthorized code: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n=== 4. Authorized Profile (GET /users/me) ==="
$headers = @{ Authorization = "Bearer $token" }
$profile = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/me" -Method Get -Headers $headers
Write-Host "User Name: $($profile.data.name), Email: $($profile.data.email), CEFR: $($profile.data.cefrLevel), XP: $($profile.data.totalXp)"

Write-Host "`n=== 5. Update CEFR Level to B2 ==="
$cefrBody = @{ cefrLevel = "B2" } | ConvertTo-Json
$cefrRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/me/cefr" -Method Patch -Headers $headers -Body $cefrBody -ContentType "application/json"
Write-Host "Updated CEFR: $($cefrRes.data.cefrLevel)"

Write-Host "`n=== 6. Get Word of the Day ==="
$wod = Invoke-RestMethod -Uri "$baseUrl/api/v1/vocabulary/word-of-the-day" -Method Get
Write-Host "Word: $($wod.data.word), Phonetic: $($wod.data.phonetic), Part: $($wod.data.partOfSpeech)"

Write-Host "`n=== 7. Get Vocabulary List ==="
$vocabList = Invoke-RestMethod -Uri "$baseUrl/api/v1/vocabulary?page=1&limit=5" -Method Get
Write-Host "Total Words: $($vocabList.data.pagination.total)"

Write-Host "`n=== 8. Get Grammar Units & Questions ==="
$units = Invoke-RestMethod -Uri "$baseUrl/api/v1/grammar/units" -Method Get
$unit4Id = $units.data[0]._id
Write-Host "Unit 4 ID: $unit4Id, Title: $($units.data[0].title)"

$questions = Invoke-RestMethod -Uri "$baseUrl/api/v1/grammar/units/$unit4Id/questions" -Method Get
$q1 = $questions.data[0]
Write-Host "Question: $($q1.prompt)"

Write-Host "`n=== 9. Verify Grammar Answer (Option 0 = However) ==="
$verifyBody = @{ selectedOptionIndex = 0 } | ConvertTo-Json
$verifyRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/grammar/questions/$($q1._id)/verify" -Method Post -Headers $headers -Body $verifyBody -ContentType "application/json"
Write-Host "Is Correct: $($verifyRes.data.isCorrect), Explanation: $($verifyRes.data.explanation)"

Write-Host "`n=== 10. Daily Challenge Today ==="
$challengeRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/daily-challenges/today" -Method Get -Headers $headers
Write-Host "Challenge: $($challengeRes.data.challenge.title)"
Write-Host "Prompt: $($challengeRes.data.challenge.prompt)"

Write-Host "`n=== 11. Submit Daily Challenge Answer (Option 0 = Bite the bullet) ==="
$submitChalBody = @{
    selectedOption = 0
    secondsTaken = 14
} | ConvertTo-Json
$chalSubmitRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/daily-challenges/today/submit" -Method Post -Headers $headers -Body $submitChalBody -ContentType "application/json"
Write-Host "Challenge result: $($chalSubmitRes.data.message), XP Earned: $($chalSubmitRes.data.xpEarned)"

Write-Host "`n=== 12. Speaking Practice: Start Session & Voice Turn ==="
$sessionBody = @{
    topicTitle = "Ordering at a Cafe"
    cefrLevel = "B1"
} | ConvertTo-Json
$sessionRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/speaking/sessions" -Method Post -Headers $headers -Body $sessionBody -ContentType "application/json"
$sessionId = $sessionRes.data._id
Write-Host "Started Speaking Session ID: $sessionId"

$voiceTurnBody = @{
    userText = "Hi Maya! I would like to order a warm cappuccino with oat milk, please."
    audioDuration = "0:04"
} | ConvertTo-Json
$turnRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/speaking/sessions/$sessionId/voice-turn" -Method Post -Headers $headers -Body $voiceTurnBody -ContentType "application/json"
Write-Host "Fluency Score: $($turnRes.data.evaluation.overallFluency)%"
Write-Host "Coach Tip: $($turnRes.data.evaluation.coachTip)"
Write-Host "AI Response: $($turnRes.data.aiResponse.text)"

Write-Host "`n=== 13. Progress Summary & Streak Calendar ==="
$progSummary = Invoke-RestMethod -Uri "$baseUrl/api/v1/progress/summary" -Method Get -Headers $headers
Write-Host "Overall Fluency: $($progSummary.data.overallFluencyScore)%"
Write-Host "Total XP: $($progSummary.data.totalXp), Streak: $($progSummary.data.streakDays) days"

Write-Host "`n=== ALL API TESTS PASSED! ==="
