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
     * Generates a conftest.py file that exposes helpers for wire tests.
     *
     * The actual WireMock container lifecycle is managed by a top-level pytest
     * plugin generated alongside this file. This ensures that the container is
     * started exactly once even when running the full test suite with
     * pytest-xdist parallelization.
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

        return `"""
Pytest configuration for wire tests.

This module provides helpers for creating a configured client that talks to
WireMock and for verifying requests in WireMock.

The WireMock container lifecycle itself is managed by the generated
pytest plugin (wiremock_pytest_plugin.py), which ensures the container is
started exactly once even when running the full test suite with
pytest-xdist parallelization.
"""
import os
import subprocess
from typing import Any, Dict, Optional

import pytest
import requests

${clientImport}


def _compose_file() -> str:
    """Returns the path to the docker-compose file for WireMock."""
    test_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(test_dir, "..", ".."))
    wiremock_dir = os.path.join(project_root, "wiremock")
    return os.path.join(wiremock_dir, "docker-compose.test.yml")


def _start_wiremock() -> None:
    """Starts the WireMock container using docker-compose."""
    compose_file = _compose_file()
    print("\\nStarting WireMock container...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", compose_file, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True,
        )
        print("WireMock container is ready")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise


def _stop_wiremock() -> None:
    """Stops and removes the WireMock container."""
    compose_file = _compose_file()
    print("\\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", compose_file, "down", "-v"],
        check=False,
        capture_output=True,
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
     * Generates a top-level pytest plugin that is always loaded when running tests.
     *
     * This plugin is responsible for starting and stopping the WireMock container
     * exactly once per test run, including when running with pytest-xdist over
     * the entire test suite (not just tests/wire).
     */
    private generatePytestPluginFile(): void {
        const pluginContent = this.buildPytestPluginContent();
        const pluginDirectory = RelativeFilePath.of(`src/${this.context.config.organization}`);
        const pluginFile = new File("wiremock_pytest_plugin.py", pluginDirectory, pluginContent);

        this.context.project.addRawFiles(pluginFile);
        this.context.logger.debug("Generated wiremock_pytest_plugin.py pytest plugin for WireMock lifecycle");
    }

    /**
     * Builds the content for the pytest plugin that manages the WireMock container lifecycle.
     *
     * The plugin reuses the _start_wiremock and _stop_wiremock helpers defined in
     * tests/wire/conftest.py by loading that module dynamically from disk. This avoids
     * having to duplicate the container management logic while still ensuring that
     * the container is started from the pytest controller process.
     */
    private buildPytestPluginContent(): string {
        return `"""
Pytest plugin that manages the WireMock container lifecycle for wire tests.

This plugin is loaded globally for the test suite and is responsible for
starting and stopping the WireMock container exactly once per test run,
including when running with pytest-xdist over the entire project.

It delegates to the helper functions defined in tests/wire/conftest.py so
that all container configuration lives in a single place.
"""

import importlib.util
import os
from types import ModuleType
from typing import Optional

import pytest


_WIRE_CONFTEST_MODULE: Optional[ModuleType] = None


def _load_wire_conftest() -> ModuleType:
    """
    Dynamically loads the tests/wire/conftest.py module so that its helpers
    can be reused from this plugin, even though it lives under the tests/
    tree and is not importable as a regular Python package module.

    The plugin itself lives under the installed SDK package, so we walk up to the
    project root before resolving the tests/wire path.
    """
    package_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(package_dir, os.pardir, os.pardir))
    conftest_path = os.path.join(project_root, "tests", "wire", "conftest.py")

    if not os.path.exists(conftest_path):
        raise RuntimeError(f"WireMock conftest not found at {conftest_path}")

    spec = importlib.util.spec_from_file_location("wire_tests_conftest", conftest_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load WireMock conftest from {conftest_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore[attr-defined]
    return module


def _get_wire_conftest() -> ModuleType:
    global _WIRE_CONFTEST_MODULE
    if _WIRE_CONFTEST_MODULE is None:
        _WIRE_CONFTEST_MODULE = _load_wire_conftest()
    return _WIRE_CONFTEST_MODULE


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

    wire_conf = _get_wire_conftest()
    start = getattr(wire_conf, "_start_wiremock", None)
    if start is not None:
        start()


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

    wire_conf = _get_wire_conftest()
    stop = getattr(wire_conf, "_stop_wiremock", None)
    if stop is not None:
        stop()
`;
    }

    /**
     * Gets the client class name to import in wire tests. Honors the same overrides as the main
     * Python generator, so that if an SDK config specifies a custom client class name, the wire
     * tests import and instantiate that exact class.
     */
    private getClientClassName(): string {
        const orgName = this.context.config.organization;
        const workspaceName = this.context.config.workspaceName;

        const customConfig = (this.context.config.customConfig ?? {}) as {
            client?: { exported_class_name?: string; class_name?: string };
            client_class_name?: string;
        };

        if (customConfig.client?.exported_class_name != null) {
            return customConfig.client.exported_class_name;
        }
        if (customConfig.client_class_name != null) {
            return customConfig.client_class_name;
        }
        if (customConfig.client?.class_name != null) {
            return customConfig.client.class_name;
        }

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
