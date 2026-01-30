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

echo "\nStarting WireMock container...\n";
$cmd = sprintf(
    'docker compose -f %s up -d --wait 2>&1',
    escapeshellarg($dockerComposeFile)
);
exec($cmd, $output, $exitCode);
if ($exitCode !== 0) {
    throw new \RuntimeException("Failed to start WireMock: " . implode("\n", $output));
}
echo "WireMock container is ready\n";

// Register shutdown function to stop the container after all tests complete
register_shutdown_function(function () use ($dockerComposeFile) {
    echo "\nStopping WireMock container...\n";
    $cmd = sprintf(
        'docker compose -f %s down -v 2>&1',
        escapeshellarg($dockerComposeFile)
    );
    exec($cmd);
});
