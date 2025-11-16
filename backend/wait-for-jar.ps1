while ($true) {
    Start-Sleep -Seconds 30
    $jar = Get-ChildItem 'C:\Users\gopig\OneDrive\Documents\final year\FarmTech34\backend\target\*.jar' -ErrorAction SilentlyContinue
    if ($jar) {
        Write-Host "Build complete! JAR file: $($jar.FullName)"
        break
    }
    Write-Host "Still building... $(Get-Date -Format 'HH:mm:ss')"
}
