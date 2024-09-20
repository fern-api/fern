#!/usr/bin/env pwsh

# Exit immediately if a command fails
$ErrorActionPreference = "Stop"

$cliPath = $args[0]
$token = $args[1]

# Create a temporary directory and change to it
$testDir = New-TemporaryFile | Select-Object -ExpandProperty DirectoryName
Set-Location $testDir

# Export the FERN_TOKEN environment variable
$env:FERN_TOKEN = $token

Write-Host "Running Fern Commands!"

# Enable command tracing
$DebugPreference = "Continue"

# Run the Fern commands
node $cliPath init --organization fern
node $cliPath add fern-java-sdk
node $cliPath add fern-python-sdk
node $cliPath add fern-postman
node $cliPath generate --log-level debug

# Disable command tracing
$DebugPreference = "SilentlyContinue"

node $cliPath register --log-level debug

# Remove the temporary directory
Remove-Item -Recurse -Force $testDir
