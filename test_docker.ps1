$p1 = [System.IO.File]::Exists('\\.\pipe\dockerDesktopLinuxEngine')
$p2 = [System.IO.File]::Exists('\\.\pipe\docker_engine')
Write-Host "dockerDesktopLinuxEngine: $p1"
Write-Host "docker_engine: $p2"
