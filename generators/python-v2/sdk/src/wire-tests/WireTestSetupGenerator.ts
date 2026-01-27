import { File } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
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
     * and the supporting test helpers / plugins.
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
        this.generateConftestFile();
        this.generateInitFile();
        this.generatePytestPluginFile();
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
            RelativeFilePath.of("wiremock"),
            dockerComposeContent
        );

        this.context.project.addRawFiles(dockerComposeFile);
        this.context.logger.debug("Generated docker-compose.test.yml for WireMock container");
    }

    /**
     * Builds the content for the docker-compose.test.yml file.
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
     * Generates a conftest.py file that exposes helpers for wire tests.
     */
    private generateConftestFile(): void {
        const conftestContent = this.buildConftestContent();
        const conftestFile = new File("conftest.py", RelativeFilePath.of("tests/wire"), conftestContent);

        this.context.project.addRawFiles(conftestFile);
        this.context.logger.debug("Generated conftest.py for WireMock container lifecycle management");
    }

    /**
     * Generates an __init__.py file to make tests/wire a proper Python package
     */
    private generateInitFile(): void {
        const initFile = new File("__init__.py", RelativeFilePath.of("tests/wire"), "");
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
        const environmentSetup = this.buildEnvironmentSetup();

        return `"""
Pytest configuration for wire tests.

This module provides helpers for creating a configured client that talks to
WireMock and for verifying requests in WireMock.

The WireMock container lifecycle itself is managed by a top-level pytest
plugin (wiremock_pytest_plugin.py) so that the container is started exactly
once per test run, even when using pytest-xdist.
"""

import inspect
import os
from typing import Any, Dict, Optional

import requests

${clientImport}
${environmentSetup.imports}


def _get_wiremock_base_url() -> str:
    """Returns the WireMock base URL using the dynamically assigned port."""
    port = os.environ.get("WIREMOCK_PORT", "8080")
    return f"http://localhost:{port}"


def get_client(test_id: str) -> ${clientClassName}:
    """
    Creates a configured client instance for wire tests.

    Args:
        test_id: Unique identifier for the test, used for request tracking.

    Returns:
        A configured client instance with all required auth parameters.
    """
    test_headers = {"X-Test-Id": test_id}
    base_url = _get_wiremock_base_url()

    # Prefer passing headers directly if the client constructor supports it.
    try:
        if "headers" in inspect.signature(${clientClassName}).parameters:
            return ${clientClassName}(
                ${environmentSetup.paramDynamic},
                headers=test_headers,
${clientConstructorParams}
            )
    except (TypeError, ValueError):
        pass

    import httpx

    return ${clientClassName}(
        ${environmentSetup.paramDynamic},
        httpx_client=httpx.Client(headers=test_headers),
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
    wiremock_admin_url = f"{_get_wiremock_base_url()}/__admin"
    request_body: Dict[str, Any] = {
        "method": method,
        "urlPath": url_path,
        "headers": {"X-Test-Id": {"equalTo": test_id}},
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
     * Generates a root-level tests/conftest.py pytest plugin that is always loaded when
     * running tests. This is the canonical way to register pytest hooks for the entire
     * test suite and avoids any imports under the SDK's runtime source tree.
     *
     * The plugin is responsible for starting and stopping the WireMock container exactly
     * once per test run, including when running with pytest-xdist over the entire test
     * suite (not just tests/wire).
     */
    private generatePytestPluginFile(): void {
        const pluginContent = this.buildPytestPluginContent();
        const pluginFile = new File("conftest.py", RelativeFilePath.of("tests"), pluginContent);

        this.context.project.addRawFiles(pluginFile);
        this.context.logger.debug("Generated tests/conftest.py pytest plugin for WireMock lifecycle");
    }

    /**
     * Builds the content for the pytest plugin that manages the WireMock container lifecycle.
     *
     * The plugin is loaded via pytest_plugins declared in tests/wire/__init__.py and is
     * responsible for starting/stopping the shared WireMock container from the pytest
     * controller process only, so that all workers reuse a single instance.
     */
    private buildPytestPluginContent(): string {
        return `"""
Pytest plugin that manages the WireMock container lifecycle for wire tests.

This plugin is loaded globally for the test suite and is responsible for
starting and stopping the WireMock container exactly once per test run,
including when running with pytest-xdist over the entire project.

It lives under tests/ (as tests/conftest.py) and is discovered automatically
by pytest's normal test collection rules.
"""

import os
import subprocess

import pytest

_STARTED: bool = False
_WIREMOCK_PORT: str = "8080"  # Default, will be updated after container starts


def _compose_file() -> str:
    """Returns the path to the docker-compose file for WireMock."""
    # This file lives in tests/conftest.py, so the project root is the parent of tests.
    tests_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(tests_dir, ".."))
    wiremock_dir = os.path.join(project_root, "wiremock")
    return os.path.join(wiremock_dir, "docker-compose.test.yml")


def _project_name() -> str:
    """Returns a unique project name for this test fixture to avoid container name conflicts."""
    tests_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(tests_dir, ".."))
    # Use the last two directory names to create a unique project name
    # e.g., "python-streaming-parameter-openapi-with-wire-tests"
    parent = os.path.basename(os.path.dirname(project_root))
    current = os.path.basename(project_root)
    return f"{parent}-{current}".replace("_", "-").lower()


def _get_wiremock_port() -> str:
    """Gets the dynamically assigned port for the WireMock container."""
    compose_file = _compose_file()
    project = _project_name()
    try:
        result = subprocess.run(
            ["docker", "compose", "-f", compose_file, "-p", project, "port", "wiremock", "8080"],
            check=True,
            capture_output=True,
            text=True,
        )
        # Output is like "0.0.0.0:32768" or "[::]:32768"
        port = result.stdout.strip().split(":")[-1]
        return port
    except subprocess.CalledProcessError:
        return "8080"  # Fallback to default


def _start_wiremock() -> None:
    """Starts the WireMock container using docker-compose."""
    global _STARTED, _WIREMOCK_PORT
    if _STARTED:
        return

    compose_file = _compose_file()
    project = _project_name()
    print(f"\\nStarting WireMock container (project: {project})...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", compose_file, "-p", project, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True,
        )
        _WIREMOCK_PORT = _get_wiremock_port()
        os.environ["WIREMOCK_PORT"] = _WIREMOCK_PORT
        print(f"WireMock container is ready on port {_WIREMOCK_PORT}")
        _STARTED = True
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise


def _stop_wiremock() -> None:
    """Stops and removes the WireMock container."""
    compose_file = _compose_file()
    project = _project_name()
    print("\\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", compose_file, "-p", project, "down", "-v"],
        check=False,
        capture_output=True,
    )


def _is_xdist_worker(config: pytest.Config) -> bool:
    """
    Determines if the current process is an xdist worker.

    In pytest-xdist, worker processes have a 'workerinput' attribute
    on the config object, while the controller process does not.
    """
    return hasattr(config, "workerinput")


def pytest_configure(config: pytest.Config) -> None:
    """
    Pytest hook that runs during test session setup.

    Starts WireMock container only from the controller process (xdist)
    or the single process (non-xdist). This ensures only one container
    is started regardless of the number of worker processes.
    """
    if _is_xdist_worker(config):
        # Workers never manage the container lifecycle.
        return

    _start_wiremock()


def pytest_unconfigure(config: pytest.Config) -> None:
    """
    Pytest hook that runs during test session teardown.

    Stops WireMock container only from the controller process (xdist)
    or the single process (non-xdist). This ensures the container is
    cleaned up after all workers have finished.
    """
    if _is_xdist_worker(config):
        # Workers never manage the container lifecycle.
        return

    _stop_wiremock()
`;
    }

    /**
     * Gets the client class name to import in wire tests. Honors the same overrides as the main
     * Python generator, so that if an SDK config specifies a custom client class name, the wire
     * tests import and instantiate that exact class.
     *
     * The resolution order matches the Python v1 generator:
     * 1. client.exported_class_name (if set, this is the exported class name)
     * 2. client_class_name (deprecated top-level option)
     * 3. client.class_name (the generated class name)
     * 4. Fall back to PascalCase(org) + PascalCase(workspace)
     */
    private getClientClassName(): string {
        const orgName = this.context.config.organization;
        const workspaceName = this.context.config.workspaceName;
        const customConfig = this.context.customConfig;

        // First, resolve the base client class name (used for generation)
        const clientClassName =
            customConfig.client_class_name ??
            customConfig.client?.class_name ??
            this.toPascalCase(orgName) + this.toPascalCase(workspaceName);

        // Then, resolve the exported class name (what users import)
        // This is what wire tests should use since they import from the public API
        const exportedClassName = customConfig.client?.exported_class_name ?? clientClassName;

        return exportedClassName;
    }

    private toPascalCase(str: string): string {
        return str
            .split(/[-_]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("");
    }

    /**
     * Gets the import statement for the client class.
     */
    private getClientImport(): string {
        const clientClassName = this.getClientClassName();
        const modulePath = this.getModulePath();
        return `from ${modulePath}.client import ${clientClassName}`;
    }

    /**
     * Gets the full module path including package_path if set.
     */
    private getModulePath(): string {
        const orgName = this.context.config.organization;
        const packagePath = this.context.customConfig.package_path;
        if (packagePath) {
            const packagePathDotted = packagePath.replace(/\//g, ".");
            return `${orgName}.${packagePathDotted}`;
        }
        return orgName;
    }

    /**
     * Builds the environment setup for the conftest.py file.
     * Returns an object with imports and the parameter to use in the client constructor.
     *
     * If the IR has environments defined (single or multiple base URLs), we need to
     * create a custom environment instance that points all URLs to WireMock.
     * If no environments are defined, we use base_url directly.
     */
    private buildEnvironmentSetup(): { imports: string; param: string; paramDynamic: string } {
        const environments = this.ir.environments;

        if (environments?.environments.type !== "multipleBaseUrls") {
            // No environments defined - use base_url directly
            return {
                imports: "",
                param: 'base_url="http://localhost:8080"',
                paramDynamic: "base_url=base_url"
            };
        }

        // Handle multiple base URLs environment
        if (environments?.environments.type === "multipleBaseUrls") {
            const envConfig = environments.environments;
            const environmentClassName = this.getEnvironmentClassName();
            const modulePath = this.getModulePath();

            // Build kwargs for all base URLs pointing to WireMock (static version for backwards compat)
            const baseUrlKwargs = envConfig.baseUrls
                .map((baseUrl) => `${baseUrl.name.snakeCase.safeName}="http://localhost:8080"`)
                .join(", ");

            // Build kwargs for all base URLs using dynamic base_url variable
            const baseUrlKwargsDynamic = envConfig.baseUrls
                .map((baseUrl) => `${baseUrl.name.snakeCase.safeName}=base_url`)
                .join(", ");

            return {
                imports: `from ${modulePath}.environment import ${environmentClassName}`,
                param: `environment=${environmentClassName}(${baseUrlKwargs})`,
                paramDynamic: `environment=${environmentClassName}(${baseUrlKwargsDynamic})`
            };
        }

        assertNever(environments.environments);
    }

    /**
     * Gets the environment class name based on the client class name.
     */
    private getEnvironmentClassName(): string {
        return `${this.getClientClassName()}Environment`;
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
