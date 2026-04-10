import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMock, WireMockStubMapping } from "@fern-api/mock-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Generates setup files for wire testing, specifically docker-compose configuration
 * to spin up WireMock for testing against.
 */
export class WireTestSetupGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly ir: FernIr.IntermediateRepresentation;

    constructor(context: SdkGeneratorContext, ir: FernIr.IntermediateRepresentation) {
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

    public static getWiremockConfigContent(ir: FernIr.IntermediateRepresentation) {
        // TODO: fix hack
        // @ts-expect-error mock-utils uses ir-sdk v61 while this package uses v66;
        // the IR is structurally compatible (v66 is a superset) so this is safe.
        return new WireMock().convertToWireMock(ir);
    }

    /**
     * ISO 8601 datetime pattern that matches values with `.000` milliseconds.
     * Example: "2008-01-02T00:00:00.000Z" or "2008-01-02T00:00:00.000+05:00"
     */
    private static readonly DATETIME_WITH_ZERO_MILLIS_REGEX =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000(Z|[+-]\d{2}:\d{2})$/;

    /**
     * Strips ".000" milliseconds from all datetime query parameter values in WireMock stub mappings.
     * PHP's DateTimeInterface::RFC3339 format does not include fractional seconds, so the SDK
     * serializes datetimes as e.g. "2022-01-02T00:00:00Z" while mock-utils generates
     * "2022-01-02T00:00:00.000Z" (via Date.toISOString()). Since WireMock's equalTo matcher
     * is exact-match, the stubs never fire unless we strip the zero milliseconds.
     *
     * Mutates the input in-place for efficiency.
     */
    private static stripDatetimeMilliseconds(stubMapping: WireMockStubMapping): void {
        for (const mapping of stubMapping.mappings) {
            if (mapping.request.queryParameters) {
                for (const [, value] of Object.entries(mapping.request.queryParameters)) {
                    const paramValue = value as { equalTo: string };
                    if (
                        paramValue.equalTo != null &&
                        WireTestSetupGenerator.DATETIME_WITH_ZERO_MILLIS_REGEX.test(paramValue.equalTo)
                    ) {
                        paramValue.equalTo = paramValue.equalTo.replace(".000", "");
                    }
                }
            }
        }
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = WireTestSetupGenerator.getWiremockConfigContent(this.ir);

        // mock-utils generates datetime values using Date.toISOString() which always includes
        // ".000Z" milliseconds. PHP's DateTimeInterface::RFC3339 format omits fractional seconds,
        // so the SDK sends e.g. "2022-01-02T00:00:00Z". Strip the zero milliseconds from WireMock
        // stubs so that equalTo exact-matching works correctly.
        WireTestSetupGenerator.stripDatetimeMilliseconds(wireMockConfigContent);

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
      - "0:8080"  # Use dynamic port to avoid conflicts with concurrent tests
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
        const coreNamespace = this.context.getCoreNamespace();
        return `<?php

namespace ${namespace}\\Wire;

use Http\\Discovery\\Psr17FactoryDiscovery;
use Http\\Discovery\\Psr18ClientDiscovery;
use PHPUnit\\Framework\\TestCase;
use ${coreNamespace}\\Json\\JsonEncoder;

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
        $client = Psr18ClientDiscovery::find();
        $requestFactory = Psr17FactoryDiscovery::findRequestFactory();
        $streamFactory = Psr17FactoryDiscovery::findStreamFactory();

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

        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $request = $requestFactory->createRequest('POST', $wiremockUrl . '/__admin/requests/find')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($streamFactory->createStream(JsonEncoder::encode($body)));
        $response = $client->sendRequest($request);

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

// If WIREMOCK_URL is already set (external orchestration), skip container management
if (getenv('WIREMOCK_URL') !== false) {
    return;
}

echo "\\nStarting WireMock container...\\n";
$cmd = sprintf(
    'docker compose -f %s up -d --wait 2>&1',
    escapeshellarg($dockerComposeFile)
);
exec($cmd, $output, $exitCode);
if ($exitCode !== 0) {
    throw new \\RuntimeException("Failed to start WireMock: " . implode("\\n", $output));
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
    echo "WireMock container is ready on port {$port}\\n";
} else {
    putenv('WIREMOCK_URL=http://localhost:8080');
    echo "WireMock container is ready (default port 8080)\\n";
}

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
