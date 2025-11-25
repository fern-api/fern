import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMock } from "@fern-api/mock-utils";
import { AuthScheme, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
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
     * and conftest.py for managing container lifecycle
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
        this.generateConftestFile();
        this.generateInitFile();
    }

    public static getWiremockConfigContent(ir: IntermediateRepresentation) {
        return new WireMock().convertToWireMock(ir);
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = WireTestSetupGenerator.getWiremockConfigContent(this.ir);
        const wireMockConfigFile = new File(
            "wiremock-mappings.json",
            RelativeFilePath.of("wiremock"),
            JSON.stringify(wireMockConfigContent)
        );
        this.context.project.addRawFiles(wireMockConfigFile);
        this.context.logger.debug("Generated wiremock-mappings.json for WireMock");
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
     * Generates a conftest.py file that manages WireMock container lifecycle
     */
    private generateConftestFile(): void {
        const conftestContent = this.buildConftestContent();
        const conftestFile = new File("conftest.py", RelativeFilePath.of("./tests/wire"), conftestContent);

        this.context.project.addRawFiles(conftestFile);
        this.context.logger.debug("Generated conftest.py for WireMock container lifecycle management");
    }

    /**
     * Generates an __init__.py file to make tests/wire a proper Python package
     */
    private generateInitFile(): void {
        const initFile = new File("__init__.py", RelativeFilePath.of("./tests/wire"), "");
        this.context.project.addRawFiles(initFile);
        this.context.logger.debug("Generated __init__.py for tests/wire package");
    }

    /**
     * Builds the content for the conftest.py file
     */
    private buildConftestContent(): string {
        const clientClassName = this.getClientClassName();
        const clientImport = this.getClientImport();
        const clientConstructorParams = this.buildClientConstructorParams();

        return `"""
Pytest configuration for wire tests.

This module manages the WireMock container lifecycle for integration tests.
"""
import os
import subprocess
from typing import Any, Dict, Optional

import pytest
import requests

${clientImport}


@pytest.fixture(scope="session", autouse=True)
def wiremock_container():
    """
    Session-scoped fixture that starts WireMock container before tests
    and cleans it up after all tests complete.

    The docker-compose healthcheck ensures WireMock is ready before tests run.
    """
    # Get the directory containing the docker-compose file
    test_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(test_dir, "..", ".."))
    wiremock_dir = os.path.join(project_root, "wiremock")

    compose_file = os.path.join(wiremock_dir, "docker-compose.test.yml")

    # Start WireMock container (--wait ensures healthcheck passes before returning)
    print("\\nStarting WireMock container...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", compose_file, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True
        )
        print("WireMock container is ready")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise

    # Yield control to tests
    yield

    # Cleanup: stop and remove the container
    print("\\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", compose_file, "down", "-v"],
        check=False,
        capture_output=True
    )


def get_client(test_id: str) -> ${clientClassName}:
    """
    Creates a configured client instance for wire tests.
    
    Args:
        test_id: Unique identifier for the test, used for request tracking.
        
    Returns:
        A configured client instance with all required auth parameters.
    """
    return ${clientClassName}(
        base_url="http://localhost:8080",
        headers={"X-Test-Id": test_id},
${clientConstructorParams}
    )


def verify_request_count(
    test_id: str,
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, str]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock filtered by test ID for concurrency safety"""
    wiremock_admin_url = "http://localhost:8080/__admin"
    request_body: Dict[str, Any] = {
        "method": method,
        "urlPath": url_path,
        "headers": {"X-Test-Id": {"equalTo": test_id}}
    }
    if query_params:
        query_parameters = {k: {"equalTo": v} for k, v in query_params.items()}
        request_body["queryParameters"] = query_parameters
    response = requests.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"
`;
    }

    /**
     * Gets the client class name based on organization and workspace name.
     */
    private getClientClassName(): string {
        const orgName = this.context.config.organization;
        const workspaceName = this.context.config.workspaceName;

        const toPascalCase = (str: string) => {
            return str
                .split(/[-_]/)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join("");
        };

        return toPascalCase(orgName) + toPascalCase(workspaceName);
    }

    /**
     * Gets the import statement for the client class.
     */
    private getClientImport(): string {
        const orgName = this.context.config.organization;
        const clientClassName = this.getClientClassName();
        return `from ${orgName}.client import ${clientClassName}`;
    }

    /**
     * Builds the client constructor parameters based on the IR's auth schemes.
     * Returns a string of keyword arguments with fake values for all required auth parameters.
     */
    private buildClientConstructorParams(): string {
        const params: string[] = [];

        // Process auth schemes from the IR
        if (this.ir.auth && this.ir.auth.schemes) {
            for (const scheme of this.ir.auth.schemes) {
                const schemeParams = this.getAuthSchemeParams(scheme);
                params.push(...schemeParams);
            }
        }

        // Process global headers that might require values
        if (this.ir.headers) {
            for (const header of this.ir.headers) {
                const paramName = header.name.name.snakeCase.safeName;
                // Only add if not already added by auth schemes
                if (!params.some((p) => p.startsWith(`        ${paramName}=`))) {
                    params.push(`        ${paramName}="test_${paramName}",`);
                }
            }
        }

        return params.join("\n");
    }

    /**
     * Gets the constructor parameters for a specific auth scheme.
     */
    private getAuthSchemeParams(scheme: AuthScheme): string[] {
        const params: string[] = [];

        switch (scheme.type) {
            case "bearer":
                // Bearer auth uses a token parameter
                params.push(`        ${scheme.token.snakeCase.safeName}="test_token",`);
                break;

            case "basic":
                // Basic auth uses username and password parameters
                params.push(`        ${scheme.username.snakeCase.safeName}="test_username",`);
                params.push(`        ${scheme.password.snakeCase.safeName}="test_password",`);
                break;

            case "header":
                // Header auth uses a custom header parameter
                params.push(
                    `        ${scheme.name.name.snakeCase.safeName}="test_${scheme.name.name.snakeCase.safeName}",`
                );
                break;

            case "oauth":
                // OAuth typically uses client credentials
                if (scheme.configuration) {
                    // For client credentials OAuth, we need client_id and client_secret
                    // The actual parameter names depend on the OAuth configuration
                    params.push(`        _token_getter_override=lambda: "test_token",`);
                }
                break;

            case "inferred":
                // Inferred auth - handle based on the inferred type
                // For now, we'll add a generic token parameter
                params.push(`        _token_getter_override=lambda: "test_token",`);
                break;
        }

        return params;
    }
}
