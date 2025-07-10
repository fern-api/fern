Write-Host "=== Testing Fern CLI with Symlink Fix ==="

# Test symlink creation (should fail)
Write-Host "Testing symlink creation on Windows..."
try {
    New-Item -ItemType SymbolicLink -Path "test-link" -Target "test-target"
    Write-Host "Symlink created successfully"
} catch {
    Write-Host "Symlink creation failed (expected): $($_.Exception.Message)"
}

# Test the built CLI
Write-Host "Testing built Fern CLI..."
$cliPath = "C:\workspace\packages\cli\cli\dist\dev\cli.cjs"

if (-not (Test-Path $cliPath)) {
    Write-Error "CLI path does not exist: $cliPath"
    exit 1
}

Write-Host "CLI version:"
& node $cliPath -v

# Create a test project
Write-Host "Creating test project..."
& node $cliPath init --docs --yes

# Test docs dev with trace logging
Write-Host "Testing fern docs dev with symlink fix..."
$process = Start-Process node -ArgumentList "$cliPath", "docs", "dev", "--log-level", "trace" -PassThru -RedirectStandardOutput "output.txt" -RedirectStandardError "error.txt"
$process.WaitForExit(30000)

$output = Get-Content "output.txt", "error.txt" -Raw

# Check for symlink skip logs
if ($output -match "Skipping symlink:") {
    $symlinkCount = ($output | Select-String "Skipping symlink:").Count
    Write-Host "✓ Found $symlinkCount symlink skip logs - filter is working"
} else {
    Write-Host "ℹ No symlinks found to skip"
}

# Check for the original error (should not appear)
if ($output -match "Failed to download docs preview bundle") {
    Write-Error "Found 'Failed to download docs preview bundle' in output"
    exit 1
}

# Check that the process completed successfully
if ($process.ExitCode -ne 0) {
    Write-Error "Process failed with exit code: $($process.ExitCode)"
    exit 1
}

Write-Host "✓ Test passed - docs dev command completed successfully with symlink fix"