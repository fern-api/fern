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
    
    & node $cli_path init --organization fern --fern-definition
    
    & node $cli_path add fern-java-sdk
    & node $cli_path add fern-python-sdk
    & node $cli_path add fern-postman
    # Place fern-typescript-sdk in its own `ts-sdk` group so we can exercise the
    # `fern generate --group <name>` code path below. This command silently broke
    # twice on prod in the PR #438 incident with zero pre-existing coverage.
    & node $cli_path add fern-typescript-sdk --group ts-sdk
    
    & node $cli_path generate --log-level debug
    & node $cli_path generate --group ts-sdk --log-level debug
    
    $DebugPreference = "SilentlyContinue"
    & node $cli_path register --log-level debug

    # Verify `fern token` succeeds and prints a generated token. The CLI prints
    # the raw token value, so capture output and only emit a sanitised version
    # on failure — never write the unredacted output to CI logs.
    Write-Host "Testing fern token..."
    $token_output = & node $cli_path token 2>&1
    $token_exit = $LASTEXITCODE
    $token_output_string = ($token_output | Out-String)
    $sanitised = [regex]::Replace(
        $token_output_string,
        '(Generated a FERN_TOKEN for [^:]+:)\s*\S+',
        '$1 <redacted>'
    )
    if ($token_exit -ne 0) {
        Write-Host "fern token failed with exit code $token_exit. Sanitised output:"
        Write-Host $sanitised
        exit $token_exit
    }
    if ($token_output_string -notmatch 'Generated a FERN_TOKEN') {
        Write-Host "fern token did not produce expected output. Sanitised output:"
        Write-Host $sanitised
        exit 1
    }
    Write-Host "fern token succeeded"
}
finally {
    Set-Location $original_dir
    Remove-Item -Recurse -Force $test_dir -ErrorAction SilentlyContinue
}
