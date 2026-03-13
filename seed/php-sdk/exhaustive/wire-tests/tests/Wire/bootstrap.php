<?php

/**
 * Bootstrap file for wire tests.
 *
 * This file is loaded once before any tests run and manages the WireMock
 * container lifecycle - starting it once at the beginning and stopping it
 * after all tests complete.
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$projectRoot = \dirname(__DIR__, 2);
$dockerComposeFile = $projectRoot . '/wiremock/docker-compose.test.yml';

// If WIREMOCK_URL is already set (external orchestration), skip container management
if (getenv('WIREMOCK_URL') !== false) {
    return;
}

echo "\nStarting WireMock container...\n";
$cmd = sprintf(
    'docker compose -f %s up -d --wait 2>&1',
    escapeshellarg($dockerComposeFile)
);
exec($cmd, $output, $exitCode);
if ($exitCode !== 0) {
    throw new \RuntimeException("Failed to start WireMock: " . implode("\n", $output));
}

// Discover the dynamically assigned port
$portCmd = sprintf(
    'docker compose -f %s port wiremock 8080 2>&1',
    escapeshellarg($dockerComposeFile)
);
exec($portCmd, $portOutput, $portExitCode);
if ($portExitCode === 0 && !empty($portOutput[0])) {
    $parts = explode(':', $portOutput[0]);
    $port = end($parts);
    putenv("WIREMOCK_URL=http://localhost:{$port}");
    echo "WireMock container is ready on port {$port}\n";
} else {
    putenv('WIREMOCK_URL=http://localhost:8080');
    echo "WireMock container is ready (default port 8080)\n";
}

// Register shutdown function to stop the container after all tests complete
register_shutdown_function(function () use ($dockerComposeFile) {
    echo "\nStopping WireMock container...\n";
    $cmd = sprintf(
        'docker compose -f %s down -v 2>&1',
        escapeshellarg($dockerComposeFile)
    );
    exec($cmd);
});
