import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMock } from "@fern-api/mock-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * Generates setup files for wire testing, specifically docker-compose configuration
 * to spin up WireMock for testing against.
 */
export class WireTestSetupGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly ir: IntermediateRepresentation;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation) {
        this.context = context;
        this.ir = ir;
    }

    /**
     * Generates docker-compose.test.yml file to spin up WireMock as a docker container
     * and WireMockTestCase.php for managing container lifecycle
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
        this.generateWireMockTestCaseFile();
        this.generateWireTestBootstrapFile();
        this.generateWireTestPhpunitXml();
    }

    public static getWiremockConfigContent(ir: IntermediateRepresentation) {
        return new WireMock().convertToWireMock(ir);
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = WireTestSetupGenerator.getWiremockConfigContent(this.ir);
        this.context.project.addRawFiles(
            new File(
                "wiremock-mappings.json",
                RelativeFilePath.of("wiremock"),
                JSON.stringify(wireMockConfigContent, null, 2)
            )
        );
        this.context.logger.debug("Generated wiremock-mappings.json for WireMock");
    }

    /**
     * Generates a docker-compose.test.yml file for spinning up WireMock
     * for wire test execution.
     */
    private generateDockerComposeFile(): void {
        const dockerComposeContent = this.buildDockerComposeContent();
        this.context.project.addRawFiles(
            new File("docker-compose.test.yml", RelativeFilePath.of("wiremock"), dockerComposeContent)
        );
        this.context.logger.debug("Generated docker-compose.test.yml for WireMock container");
    }

    /**
     * Builds the content for the docker-compose.test.yml file
     */
    private buildDockerComposeContent(): string {
        return `services:
  wiremock:
    image: wiremock/wiremock:3.9.1
    ports:
      - "8080:8080"
    volumes:
      - ./wiremock-mappings.json:/home/wiremock/mappings/wiremock-mappings.json
    command: ["--global-response-templating", "--verbose"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/__admin/health"]
      interval: 2s
      timeout: 5s
      retries: 15
      start_period: 5s
`;
    }

    /**
     * Generates a WireMockTestCase.php file that manages WireMock container lifecycle
     */
    private generateWireMockTestCaseFile(): void {
        const testCaseContent = this.buildWireMockTestCaseContent();
        this.context.project.addRawFiles(
            new File("WireMockTestCase.php", RelativeFilePath.of("tests/Wire"), testCaseContent)
        );
        this.context.logger.debug("Generated WireMockTestCase.php for WireMock container lifecycle management");
    }

    /**
     * Builds the content for the WireMockTestCase.php file
     */
    private buildWireMockTestCaseContent(): string {
        const namespace = this.context.getTestsNamespace();
        return `<?php

namespace ${namespace}\\Wire;

use GuzzleHttp\\Client as HttpClient;
use PHPUnit\\Framework\\TestCase;

/**
 * Base test case for WireMock-based wire tests.
 *
 * The WireMock container lifecycle is managed by the bootstrap file (tests/Wire/bootstrap.php)
 * which starts the container once before all tests and stops it after all tests complete.
 */
abstract class WireMockTestCase extends TestCase
{
    /**
     * Verifies the number of requests made to WireMock filtered by test ID for concurrency safety.
     *
     * @param string $testId The test ID used to filter requests
     * @param string $method The HTTP method (GET, POST, etc.)
     * @param string $urlPath The URL path to match
     * @param array<string, string>|null $queryParams Query parameters to match
     * @param int $expected Expected number of requests
     */
    protected function verifyRequestCount(
        string $testId,
        string $method,
        string $urlPath,
        ?array $queryParams,
        int $expected
    ): void {
        $client = new HttpClient();
        $body = [
            'method' => $method,
            'urlPath' => $urlPath,
            'headers' => [
                'X-Test-Id' => ['equalTo' => $testId],
            ],
        ];
        if ($queryParams !== null && $queryParams !== []) {
            $body['queryParameters'] = [];
            foreach ($queryParams as $k => $v) {
                $body['queryParameters'][$k] = ['equalTo' => (string) $v];
            }
        }

        $response = $client->post('http://localhost:8080/__admin/requests/find', [
            'json' => $body,
        ]);

        $this->assertSame(200, $response->getStatusCode(), 'Failed to query WireMock requests');

        $json = json_decode((string) $response->getBody(), true);
        
        // Ensure we have an array; otherwise, fail the test.
        if (!is_array($json)) {
            $this->fail('Expected WireMock to return a JSON object.');
        }

        /** @var array<string, mixed> $json */
        $requests = [];
        if (isset($json['requests']) && is_array($json['requests'])) {
            $requests = $json['requests'];
        }

        /** @var array<int, mixed> $requests */
        $this->assertCount(
            $expected,
            $requests,
            sprintf('Expected %d requests, found %d', $expected, count($requests))
        );
    }
}
`;
    }

    /**
     * Generates a bootstrap file that starts WireMock once before all tests
     * and registers a shutdown function to stop it after all tests complete.
     */
    private generateWireTestBootstrapFile(): void {
        const bootstrapContent = this.buildWireTestBootstrapContent();
        this.context.project.addRawFiles(
            new File("bootstrap.php", RelativeFilePath.of("tests/Wire"), bootstrapContent)
        );
        this.context.logger.debug("Generated bootstrap.php for WireMock container lifecycle management");
    }

    /**
     * Builds the content for the bootstrap.php file
     */
    private buildWireTestBootstrapContent(): string {
        return `<?php

/**
 * Bootstrap file for wire tests.
 *
 * This file is loaded once before any tests run and manages the WireMock
 * container lifecycle - starting it once at the beginning and stopping it
 * after all tests complete.
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$projectRoot = \\dirname(__DIR__, 2);
$dockerComposeFile = $projectRoot . '/wiremock/docker-compose.test.yml';

echo "\\nStarting WireMock container...\\n";
$cmd = sprintf(
    'docker compose -f %s up -d --wait 2>&1',
    escapeshellarg($dockerComposeFile)
);
exec($cmd, $output, $exitCode);
if ($exitCode !== 0) {
    throw new \\RuntimeException("Failed to start WireMock: " . implode("\\n", $output));
}
echo "WireMock container is ready\\n";

// Register shutdown function to stop the container after all tests complete
register_shutdown_function(function () use ($dockerComposeFile) {
    echo "\\nStopping WireMock container...\\n";
    $cmd = sprintf(
        'docker compose -f %s down -v 2>&1',
        escapeshellarg($dockerComposeFile)
    );
    exec($cmd);
});
`;
    }

    /**
     * Generates a phpunit.xml file that uses the wire bootstrap.
     * This overrides the default phpunit.xml so that `composer test` works correctly.
     */
    private generateWireTestPhpunitXml(): void {
        const phpunitContent = this.buildWireTestPhpunitXmlContent();
        this.context.project.addRawFiles(new File("phpunit.xml", RelativeFilePath.of(""), phpunitContent));
        this.context.logger.debug("Generated phpunit.xml with wire test bootstrap");
    }

    /**
     * Builds the content for the phpunit.xml file with wire test bootstrap.
     * This runs all tests (including wire tests) with WireMock started.
     */
    private buildWireTestPhpunitXmlContent(): string {
        return `<phpunit bootstrap="tests/Wire/bootstrap.php">
    <testsuites>
        <testsuite name="Test Suite">
            <directory suffix="Test.php">tests</directory>
        </testsuite>
    </testsuites>
</phpunit>
`;
    }
}
