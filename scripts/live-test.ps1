param(
    [Parameter(Mandatory=$true)]
    [string]$cli_path,
    
    [Parameter(Mandatory=$true)]
    [string]$token
)

$ErrorActionPreference = "Stop"

function New-TemporaryDirectory {
    $parent = [System.IO.Path]::GetTempPath()
    $name = [System.Guid]::NewGuid().ToString()
    $path = Join-Path $parent $name
    New-Item -ItemType Directory -Path $path
}

$original_dir = Get-Location
$test_dir = New-TemporaryDirectory
Set-Location $test_dir

try {
    $env:FERN_TOKEN = $token

    Write-Host "Running Fern Commands!"
    $DebugPreference = "Continue"
    
    # Initialize Fern project
    & node $cli_path init --organization fern
    
    # Create test docs structure
    New-Item -ItemType Directory -Path "docs\images" -Force
    
    # Create a test image
    "Test Image Content" | Out-File -FilePath "docs\images\test.png"
    
    # Create test markdown with various Windows path formats
    $testMarkdown = @"
# Test Document

## Relative Path Tests
![Relative Image](.\images\test.png)
![Parent Path](..\docs\images\test.png)

## Absolute Path Tests
![Absolute Path](${test_dir}\docs\images\test.png)

## Mixed Slash Tests
![Mixed Slashes](./images\test.png)
"@
    Set-Content -Path "docs\test.md" -Value $testMarkdown
    
    Write-Host "Created test markdown with Windows paths"
    Get-Content "docs\test.md"
    
    # Run normal commands
    & node $cli_path add fern-java-sdk
    & node $cli_path add fern-python-sdk
    & node $cli_path add fern-postman
    & node $cli_path generate --log-level debug
    
    # Verify the generated output
    Write-Host "Checking generated docs..."
    if (Test-Path ".fern\generated-docs") {
        Get-Content ".fern\generated-docs\*.md" | Select-String -Pattern "file:"
    } else {
        Write-Error "Generated docs not found!"
    }
    
    $DebugPreference = "SilentlyContinue"
    & node $cli_path register --log-level debug
}
finally {
    Set-Location $original_dir
    Remove-Item -Recurse -Force $test_dir -ErrorAction SilentlyContinue
}