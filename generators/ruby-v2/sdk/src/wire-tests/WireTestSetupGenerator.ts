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
     * and WireMockTestCase.rb for managing container lifecycle and helper methods
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
        this.generateWireMockTestCaseFile();
        this.generateWireHelper();
    }

    public static getWiremockConfigContent(ir: IntermediateRepresentation) {
        return new WireMock().convertToWireMock(ir);
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = WireTestSetupGenerator.getWiremockConfigContent(this.ir);

        // Add OAuth token endpoint mapping if inferred auth is present
        const inferredAuth = this.context.getInferredAuth();
        if (inferredAuth != null) {
            const tokenEndpointMapping = this.buildOAuthTokenEndpointMapping(inferredAuth);
            if (tokenEndpointMapping != null) {
                wireMockConfigContent.mappings.push(tokenEndpointMapping);
                if (wireMockConfigContent.meta) {
                    wireMockConfigContent.meta.total = wireMockConfigContent.mappings.length;
                }
            }
        }

        const wireMockConfigFile = new File(
            "wiremock-mappings.json",
            RelativeFilePath.of("wiremock"),
            JSON.stringify(wireMockConfigContent)
        );
        this.context.project.addRawFiles(wireMockConfigFile);
        this.context.logger.debug("Generated wiremock-mappings.json for WireMock");
    }

    /**
     * Builds a WireMock mapping for the OAuth token endpoint.
     * This is needed for wire tests that use inferred auth (OAuth client credentials).
     */
    private buildOAuthTokenEndpointMapping(
        inferredAuth: ReturnType<SdkGeneratorContext["getInferredAuth"]>
    ): ReturnType<WireMock["convertToWireMock"]>["mappings"][0] | null {
        if (inferredAuth == null) {
            return null;
        }

        const tokenEndpointRef = inferredAuth.tokenEndpoint.endpoint;
        const service = this.ir.services[tokenEndpointRef.serviceId];
        if (service == null) {
            return null;
        }

        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointRef.endpointId);
        if (endpoint == null) {
            return null;
        }

        // Build the URL path for the token endpoint
        let urlPath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            urlPath += `{${part.pathParameter}}${part.tail}`;
        }
        if (!urlPath.startsWith("/")) {
            urlPath = "/" + urlPath;
        }

        // Build the response body with token information
        const responseBody = {
            access_token: "test_access_token",
            token_type: "Bearer",
            expires_in: 3600,
            scope: "api"
        };

        // Generate a deterministic UUID for the mapping
        const uuid = this.deterministicUUIDv4(`oauth-token-${endpoint.id}-${urlPath}`);

        return {
            id: uuid,
            name: "OAuth Token Endpoint - get token",
            request: {
                urlPathTemplate: urlPath,
                method: endpoint.method
            },
            response: {
                status: 200,
                body: JSON.stringify(responseBody),
                headers: {
                    "Content-Type": "application/json"
                }
            },
            uuid,
            persistent: true,
            priority: 1, // High priority to ensure this mapping is used
            metadata: {
                mocklab: {
                    created: {
                        at: "2020-01-01T00:00:00.000Z",
                        via: "SYSTEM"
                    }
                }
            }
        };
    }

    /**
     * Generates a deterministic UUID v4 from a string.
     */
    private deterministicUUIDv4(hashArgument: string): string {
        const crypto = require("crypto");
        const hash = crypto.createHash("sha1").update(hashArgument);
        const hashBytes = hash.digest().subarray(0, 16);

        const bytes: number[] = Array.from(hashBytes);
        const byte6 = bytes[6];
        const byte8 = bytes[8];

        if (byte6 === undefined || byte8 === undefined) {
            throw new Error("Invalid byte array: missing required bytes");
        }

        bytes[6] = (byte6 & 0x0f) | 0x40;
        bytes[8] = (byte8 & 0x3f) | 0x80;

        const raw = bytes.map((byte) => (byte + 0x100).toString(16).substring(1)).join("");

        return [
            raw.substring(0, 8),
            raw.substring(8, 12),
            raw.substring(12, 16),
            raw.substring(16, 20),
            raw.substring(20, 32)
        ].join("-");
    }

    /**
     * Generates a docker-compose.test.yml file for spinning up WireMock
     * for wire test execution.
     */
    private generateDockerComposeFile(): void {
        const dockerComposeContent = this.buildDockerComposeContent();
        const dockerComposeFile = new File(
            "docker-compose.test.yml",
            RelativeFilePath.of("./wiremock"),
            dockerComposeContent
        );

        this.context.project.addRawFiles(dockerComposeFile);
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
     * Generates a WireMockTestCase.rb file that provides a base test case class
     * with helper methods for WireMock-based wire tests.
     */
    private generateWireMockTestCaseFile(): void {
        const testCaseContent = this.buildWireMockTestCaseContent();
        const testCaseFile = new File("wiremock_test_case.rb", RelativeFilePath.of("test/wire"), testCaseContent);
        this.context.project.addRawFiles(testCaseFile);
        this.context.logger.debug("Generated wiremock_test_case.rb for WireMock helper methods");
    }

    /**
     * Builds the content for the WireMockTestCase.rb file
     */
    private buildWireMockTestCaseContent(): string {
        const rootFolderName = this.context.getRootFolderName();
        return `# frozen_string_literal: true

require "test_helper"
require_relative "wire_helper"
require "net/http"
require "json"
require "uri"
require "${rootFolderName}"

# Base test case for WireMock-based wire tests.
#
# This class provides helper methods for verifying requests made to WireMock
# and manages the test lifecycle for integration tests.
class WireMockTestCase < Minitest::Test
  WIREMOCK_BASE_URL = "http://localhost:8080"
  WIREMOCK_ADMIN_URL = "http://localhost:8080/__admin"

  def setup
    super
    unless ENV["RUN_WIRE_TESTS"] == "true"
      skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them."
    end
  end

  # Verifies the number of requests made to WireMock filtered by test ID for concurrency safety.
  #
  # @param test_id [String] The test ID used to filter requests
  # @param method [String] The HTTP method (GET, POST, etc.)
  # @param url_path [String] The URL path to match
  # @param query_params [Hash, nil] Query parameters to match
  # @param expected [Integer] Expected number of requests
  def verify_request_count(test_id:, method:, url_path:, query_params: nil, expected:)
    uri = URI("#{WIREMOCK_ADMIN_URL}/requests/find")
    http = Net::HTTP.new(uri.host, uri.port)
    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })

    request_body = { "method" => method, "urlPath" => url_path }
    request_body["headers"] = { "X-Test-Id" => { "equalTo" => test_id } }
    if query_params
      request_body["queryParameters"] = query_params.transform_values { |v| { "equalTo" => v } }
    end

    post_request.body = request_body.to_json
    response = http.request(post_request)
    result = JSON.parse(response.body)
    requests = result["requests"] || []

    assert_equal expected, requests.length, "Expected #{expected} requests, found #{requests.length}"
  end
end
`;
    }

    /**
     * Generates wire_helper.rb file that manages WireMock container lifecycle.
     * This is the Ruby equivalent of Python's conftest.py for wire tests.
     */
    private generateWireHelper(): void {
        const wireHelperContent = this.buildWireHelperContent();
        const wireHelperFile = new File("wire_helper.rb", RelativeFilePath.of("test/wire"), wireHelperContent);

        this.context.project.addRawFiles(wireHelperFile);
        this.context.logger.debug("Generated wire_helper.rb for WireMock container lifecycle management");
    }

    /**
     * Builds the content for wire_helper.rb which manages WireMock container lifecycle.
     * When tests require this file, it will:
     * 1. Start the WireMock container before any tests run
     * 2. Stop the WireMock container after all tests complete
     */
    private buildWireHelperContent(): string {
        return `# frozen_string_literal: true

require "test_helper"

# WireMock container lifecycle management for wire tests.
# This file is the Ruby equivalent of Python's conftest.py for wire tests.
# It automatically starts the WireMock container before tests and stops it after.

WIREMOCK_COMPOSE_FILE = File.expand_path("../../wiremock/docker-compose.test.yml", __dir__)

# Start WireMock container when this file is required
if ENV["RUN_WIRE_TESTS"] == "true" && File.exist?(WIREMOCK_COMPOSE_FILE)
  puts "Starting WireMock container..."
  unless system("docker compose -f #{WIREMOCK_COMPOSE_FILE} up -d --wait")
    warn "Failed to start WireMock container"
  end

  # Stop WireMock container after all tests complete
  Minitest.after_run do
    puts "Stopping WireMock container..."
    system("docker compose -f #{WIREMOCK_COMPOSE_FILE} down")
  end
end
`;
    }
}
