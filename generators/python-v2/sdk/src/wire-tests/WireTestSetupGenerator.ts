import { File, getNameFromWireValue, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { isEqualToMatcher, WireMock, WireMockStubMapping } from "@fern-api/mock-utils";
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
     * and the supporting test helpers / plugins.
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
        this.generateConftestFile();
        this.generateInitFile();
        this.generatePytestPluginFile();
    }

    public static getWiremockConfigContent(ir: FernIr.IntermediateRepresentation) {
        // ir-sdk versions may differ between python-sdk and mock-utils;
        // 66.3.0 is a strict superset (adds optional fields only), so this is safe.
        return new WireMock().convertToWireMock(ir as Parameters<WireMock["convertToWireMock"]>[0]);
    }

    /**
     * ISO 8601 datetime pattern that matches values with `.000` milliseconds.
     * Example: "2008-01-02T00:00:00.000Z" or "2008-01-02T00:00:00.000+05:00"
     */
    private static readonly DATETIME_WITH_ZERO_MILLIS_REGEX =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000(Z|[+-]\d{2}:\d{2})$/;

    /**
     * Strips ".000" milliseconds from all datetime values in WireMock stub mappings.
     * This is used when datetime_milliseconds is false (default) so that WireMock stubs
     * match the SDK's default serialize_datetime output (which omits zero fractional seconds).
     *
     * Mutates the input in-place for efficiency.
     */
    public static stripDatetimeMilliseconds(stubMapping: WireMockStubMapping): void {
        for (const mapping of stubMapping.mappings) {
            // Strip from query parameters
            if (mapping.request.queryParameters) {
                for (const [, value] of Object.entries(mapping.request.queryParameters)) {
                    if (!isEqualToMatcher(value)) {
                        continue;
                    }
                    if (WireTestSetupGenerator.DATETIME_WITH_ZERO_MILLIS_REGEX.test(value.equalTo)) {
                        value.equalTo = value.equalTo.replace(".000", "");
                    }
                }
            }
        }
    }

    /**
     * Strips ".000" milliseconds only from string-typed query parameters in WireMock stub mappings.
     * When datetime_milliseconds is true, datetime-typed params should keep ".000" (because
     * serialize_datetime will output milliseconds), but string-typed params should have ".000"
     * stripped (because the SDK passes strings through as-is without millisecond normalization).
     *
     * Mutates the input in-place for efficiency.
     */
    private stripDatetimeMillisecondsForStringParams(
        stubMapping: WireMockStubMapping,
        ir: FernIr.IntermediateRepresentation
    ): void {
        // Build a lookup: mapping key -> set of datetime-typed query param wire names
        const datetimeParamsByEndpoint = new Map<string, Set<string>>();
        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                let path = endpoint.fullPath.head;
                for (const part of endpoint.fullPath.parts) {
                    path += `{${part.pathParameter}}${part.tail}`;
                }
                if (!path.startsWith("/")) {
                    path = "/" + path;
                }
                // Strip URL fragments (mock-utils strips them too)
                const fragmentIndex = path.indexOf("#");
                if (fragmentIndex !== -1) {
                    path = path.substring(0, fragmentIndex);
                }
                const key = `${endpoint.method} - ${path}`;
                const datetimeParams = new Set<string>();
                for (const qp of endpoint.queryParameters) {
                    if (WireTestSetupGenerator.isDatetimeTypeReference(qp.valueType)) {
                        datetimeParams.add(getWireValue(qp.name));
                    }
                }
                datetimeParamsByEndpoint.set(key, datetimeParams);
            }
        }

        for (const mapping of stubMapping.mappings) {
            if (!mapping.request.queryParameters) {
                continue;
            }
            const mappingKey = `${mapping.request.method} - ${mapping.request.urlPathTemplate}`;
            const datetimeParams = datetimeParamsByEndpoint.get(mappingKey) ?? new Set<string>();

            for (const [paramName, value] of Object.entries(mapping.request.queryParameters)) {
                // Skip datetime-typed params — they should keep .000 when datetime_milliseconds is true
                if (datetimeParams.has(paramName)) {
                    continue;
                }
                if (!("equalTo" in value)) {
                    continue;
                }
                if (
                    value.equalTo != null &&
                    WireTestSetupGenerator.DATETIME_WITH_ZERO_MILLIS_REGEX.test(value.equalTo)
                ) {
                    value.equalTo = value.equalTo.replace(".000", "");
                }
            }
        }
    }

    /**
     * Recursively checks if a TypeReference resolves to a datetime primitive.
     * Unwraps optional/nullable containers to check the inner type.
     */
    private static isDatetimeTypeReference(typeRef: FernIr.TypeReference): boolean {
        if (typeRef.type === "primitive") {
            return typeRef.primitive.v1 === "DATE_TIME";
        }
        if (typeRef.type === "container") {
            if (typeRef.container.type === "optional") {
                return WireTestSetupGenerator.isDatetimeTypeReference(typeRef.container.optional);
            }
            if (typeRef.container.type === "nullable") {
                return WireTestSetupGenerator.isDatetimeTypeReference(typeRef.container.nullable);
            }
        }
        return false;
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = WireTestSetupGenerator.getWiremockConfigContent(this.ir);

        // mock-utils always generates datetime values using Date.toISOString() which includes
        // ".000Z". We need to normalize these based on the datetime_milliseconds config and
        // the actual parameter types:
        //
        // When datetime_milliseconds is false (default): strip ".000" from ALL datetime query
        // param values, since the SDK's default serialize_datetime (isoformat()) omits zero
        // fractional seconds.
        //
        // When datetime_milliseconds is true: keep ".000" for datetime-typed params (because
        // serialize_datetime will output milliseconds), but strip ".000" for string-typed params
        // (because the SDK passes strings through as-is without calling serialize_datetime).
        if (!this.context.customConfig.datetime_milliseconds) {
            WireTestSetupGenerator.stripDatetimeMilliseconds(wireMockConfigContent);
        } else {
            this.stripDatetimeMillisecondsForStringParams(wireMockConfigContent, this.ir);
        }

        const wireMockConfigFile = new File(
            "wiremock-mappings.json",
            RelativeFilePath.of("wiremock"),
            JSON.stringify(wireMockConfigContent, null, 2)
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
    command: ["--verbose"]
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
        // The per-endpoint auth-header assertion helper (and its `re`/`List` imports) is
        // only used by endpoint-security wire tests, so it is emitted only in that mode to
        // avoid introducing an unused helper into every other fixture's conftest.
        const isEndpointSecurity = this.ir.auth?.requirement === FernIr.AuthSchemesRequirement.EndpointSecurity;
        const typingImport = isEndpointSecurity
            ? "from typing import Any, Dict, List, Optional"
            : "from typing import Any, Dict, Optional";
        const reImport = isEndpointSecurity ? "import re\n" : "";
        const authHeadersHelper = isEndpointSecurity ? this.buildVerifyAuthHeadersHelper() : "";

        return `"""
Pytest configuration for wire tests.

This module provides helpers for creating a configured client that talks to
WireMock and for verifying requests in WireMock.

The WireMock container lifecycle itself is managed by a top-level pytest
plugin (tests/conftest.py) so that the container is started exactly once
per test run, even when using pytest-xdist.
"""

import inspect
import os
${reImport}${typingImport}

import httpx

${clientImport}
${environmentSetup.imports}

# Check once at import time whether the client constructor accepts a headers kwarg.
try:
    _CLIENT_SUPPORTS_HEADERS: bool = "headers" in inspect.signature(${clientClassName}).parameters
except (TypeError, ValueError):
    _CLIENT_SUPPORTS_HEADERS = False


def _get_wiremock_base_url() -> str:
    """Returns the WireMock base URL from the WIREMOCK_URL environment variable."""
    return os.environ.get("WIREMOCK_URL", "http://localhost:8080")


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

    if _CLIENT_SUPPORTS_HEADERS:
        return ${clientClassName}(
            ${environmentSetup.paramDynamic},
            headers=test_headers,
${clientConstructorParams}
        )

    return ${clientClassName}(
        ${environmentSetup.paramDynamic},
        httpx_client=httpx.Client(headers=test_headers),
${clientConstructorParams}
    )


def verify_request_count(
    test_id: str,
    method: str,
    url_path: str,
    query_params: Optional[Dict[str, Any]],
    expected: int,
) -> None:
    """Verifies the number of requests made to WireMock filtered by test ID for concurrency safety."""
    wiremock_admin_url = f"{_get_wiremock_base_url()}/__admin"
    request_body: Dict[str, Any] = {
        "method": method,
        "urlPath": url_path,
        "headers": {"X-Test-Id": {"equalTo": test_id}},
    }
    if query_params:
        query_parameters = {}
        for k, v in query_params.items():
            if isinstance(v, list):
                query_parameters[k] = {"hasExactly": [{"equalTo": item} for item in v]}
            else:
                query_parameters[k] = {"equalTo": v}
        request_body["queryParameters"] = query_parameters
    response = httpx.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests_found = len(result.get("requests", []))
    assert requests_found == expected, f"Expected {expected} requests, found {requests_found}"
${authHeadersHelper}`;
    }

    /**
     * Builds the endpoint-security-only `verify_auth_headers` helper appended to conftest.py.
     * Kept out of the base template so non-endpoint-security fixtures see zero churn.
     */
    private buildVerifyAuthHeadersHelper(): string {
        return `

def verify_auth_headers(
    test_id: str,
    method: str,
    url_path: str,
    present_headers: Dict[str, str],
    absent_headers: List[str],
) -> None:
    """Verifies the auth headers on the recorded request(s) for endpoint-security routing.

    'present_headers' maps a header name to a regex the header value must fully
    match; 'absent_headers' lists header names that must NOT be present. Header
    names are compared case-insensitively per HTTP semantics.

    This proves per-endpoint auth routing on the wire: only the scheme(s) declared
    for the endpoint send a header, and no other scheme's header leaks through.
    """
    wiremock_admin_url = f"{_get_wiremock_base_url()}/__admin"
    request_body: Dict[str, Any] = {
        "method": method,
        "urlPath": url_path,
        "headers": {"X-Test-Id": {"equalTo": test_id}},
    }
    response = httpx.post(f"{wiremock_admin_url}/requests/find", json=request_body)
    assert response.status_code == 200, "Failed to query WireMock requests"
    result = response.json()
    requests = result.get("requests", [])
    assert len(requests) >= 1, f"Expected at least one recorded request for test_id={test_id}"

    for recorded in requests:
        raw_headers = recorded.get("headers", {}) or {}
        # WireMock may serialize a header value as a string or a list of strings;
        # normalize to a single string and index case-insensitively.
        normalized: Dict[str, str] = {}
        for name, value in raw_headers.items():
            if isinstance(value, list):
                value = value[0] if value else ""
            normalized[name.lower()] = str(value)

        for name, pattern in present_headers.items():
            actual = normalized.get(name.lower())
            assert actual is not None, (
                f"Expected auth header '{name}' to be present for test_id={test_id}, "
                f"but it was missing. Present headers: {sorted(normalized)}"
            )
            assert re.fullmatch(pattern, actual) is not None, (
                f"Auth header '{name}'='{actual}' did not match expected pattern "
                f"'{pattern}' for test_id={test_id}"
            )

        for name in absent_headers:
            assert name.lower() not in normalized, (
                f"Expected auth header '{name}' to be ABSENT for test_id={test_id} "
                f"(endpoint-security routing must not leak other schemes), "
                f"but found '{normalized.get(name.lower())}'"
            )
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
     * Computes a Docker Compose project name at code-generation time.
     *
     * Docker Compose project names must consist only of lowercase alphanumeric
     * characters, hyphens, and underscores, and must start with a letter or number.
     * Computing this at generation time avoids runtime issues with directory names
     * that contain dots or other invalid characters (e.g. `.seed`).
     */
    private getDockerProjectName(): string {
        const orgName = this.context.config.organization;
        const workspaceName = this.context.config.workspaceName;
        const raw = `${orgName}-${workspaceName}`.toLowerCase();
        const sanitized = raw.replace(/[^a-z0-9_-]/g, "").replace(/^[^a-z0-9]+/, "");
        return sanitized || "wiremock-tests";
    }

    /**
     * Builds the content for the pytest plugin that manages the WireMock container lifecycle.
     *
     * The plugin is loaded via pytest_plugins declared in tests/wire/__init__.py and is
     * responsible for starting/stopping the shared WireMock container from the pytest
     * controller process only, so that all workers reuse a single instance.
     */
    private buildPytestPluginContent(): string {
        const projectName = this.getDockerProjectName();
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
_EXTERNAL: bool = False  # True when using an external WireMock instance (skip container lifecycle)
_WIREMOCK_URL: str = "http://localhost:8080"  # Default, will be updated after container starts
_PROJECT_NAME: str = "${projectName}"

# This file lives at tests/conftest.py, so the project root is one level up.
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_COMPOSE_FILE = os.path.join(_PROJECT_ROOT, "wiremock", "docker-compose.test.yml")


def _get_wiremock_port() -> str:
    """Gets the dynamically assigned port for the WireMock container."""
    try:
        result = subprocess.run(
            ["docker", "compose", "-f", _COMPOSE_FILE, "-p", _PROJECT_NAME, "port", "wiremock", "8080"],
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
    global _STARTED, _EXTERNAL, _WIREMOCK_URL
    if _STARTED:
        return

    # If WIREMOCK_URL is already set (e.g., by CI/CD pipeline), skip container management
    existing_url = os.environ.get("WIREMOCK_URL")
    if existing_url:
        _WIREMOCK_URL = existing_url
        _EXTERNAL = True
        _STARTED = True
        print(f"\\nUsing external WireMock at {_WIREMOCK_URL} (container management skipped)")
        return

    print(f"\\nStarting WireMock container (project: {_PROJECT_NAME})...")
    try:
        subprocess.run(
            ["docker", "compose", "-f", _COMPOSE_FILE, "-p", _PROJECT_NAME, "up", "-d", "--wait"],
            check=True,
            capture_output=True,
            text=True,
        )
        _WIREMOCK_PORT = _get_wiremock_port()
        _WIREMOCK_URL = f"http://localhost:{_WIREMOCK_PORT}"
        os.environ["WIREMOCK_URL"] = _WIREMOCK_URL
        print(f"WireMock container is ready at {_WIREMOCK_URL}")
        _STARTED = True
    except subprocess.CalledProcessError as e:
        print(f"Failed to start WireMock: {e.stderr}")
        raise


def _stop_wiremock() -> None:
    """Stops and removes the WireMock container."""
    if _EXTERNAL:
        # Container is managed externally; nothing to tear down.
        return

    print("\\nStopping WireMock container...")
    subprocess.run(
        ["docker", "compose", "-f", _COMPOSE_FILE, "-p", _PROJECT_NAME, "down", "-v"],
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


def _has_httpx_aiohttp() -> bool:
    """Check if httpx_aiohttp is importable."""
    try:
        import httpx_aiohttp  # type: ignore[import-not-found]  # noqa: F401

        return True
    except ImportError:
        return False


def pytest_collection_modifyitems(config: pytest.Config, items: list) -> None:
    """Auto-skip @pytest.mark.aiohttp tests when httpx_aiohttp is not installed."""
    if _has_httpx_aiohttp():
        return
    skip_aiohttp = pytest.mark.skip(reason="httpx_aiohttp not installed")
    for item in items:
        if "aiohttp" in item.keywords:
            item.add_marker(skip_aiohttp)


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
        const modulePath = this.context.getModulePath();
        return `from ${modulePath}.client import ${clientClassName}`;
    }

    /**
     * Builds the environment setup for the conftest.py file.
     * Returns an object with imports and the parameter to use in the client constructor.
     *
     * If the IR has environments defined (single or multiple base URLs), we need to
     * create a custom environment instance that points all URLs to WireMock.
     * If no environments are defined, we use base_url directly.
     */
    private buildEnvironmentSetup(): { imports: string; paramDynamic: string } {
        const environments = this.ir.environments;

        if (environments?.environments.type !== "multipleBaseUrls") {
            // No environments defined - use base_url directly
            return {
                imports: "",
                paramDynamic: "base_url=base_url"
            };
        }

        // Handle multiple base URLs environment
        if (environments?.environments.type === "multipleBaseUrls") {
            const envConfig = environments.environments;
            const environmentClassName = this.getEnvironmentClassName();
            const modulePath = this.context.getModulePath();

            // Build kwargs for all base URLs using dynamic base_url variable
            const baseUrlKwargsDynamic = envConfig.baseUrls
                .map((baseUrl) => `${this.context.caseConverter.snakeSafe(baseUrl.name)}=base_url`)
                .join(", ");

            return {
                imports: `from ${modulePath}.environment import ${environmentClassName}`,
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
        // Track kwarg names already emitted so we never produce a duplicate keyword
        // argument (a Python SyntaxError). Multiple auth schemes can resolve to the
        // same constructor kwarg — e.g. an `ApiKey` header scheme and an inferred-auth
        // scheme both map to `api_key` — so dedup across all sources.
        const seenParamNames = new Set<string>();
        const addParam = (line: string): void => {
            const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)=/.exec(line);
            const paramName = match?.[1];
            if (paramName != null) {
                if (seenParamNames.has(paramName)) {
                    return;
                }
                seenParamNames.add(paramName);
            }
            params.push(line);
        };

        // Process auth schemes from the IR
        const isEndpointSecurity = this.ir.auth?.requirement === FernIr.AuthSchemesRequirement.EndpointSecurity;
        const hasOAuthScheme = (this.ir.auth?.schemes ?? []).some((scheme) => scheme.type === "oauth");
        if (this.ir.auth && this.ir.auth.schemes) {
            for (const scheme of this.ir.auth.schemes) {
                for (const schemeParam of this.getAuthSchemeParams(scheme, { isEndpointSecurity, hasOAuthScheme })) {
                    addParam(schemeParam);
                }
            }
        }

        // Process global headers that might require values
        if (this.ir.headers) {
            for (const header of this.ir.headers) {
                const paramName = this.context.caseConverter.snakeSafe(getNameFromWireValue(header.name));
                addParam(`        ${paramName}="test_${paramName}",`);
            }
        }

        return params.join("\n");
    }

    /**
     * Gets the constructor parameters for a specific auth scheme.
     *
     * In endpoint-security mode a single client must carry credentials for EVERY
     * scheme so per-endpoint routing has something to route. Bearer and OAuth share
     * the client's single token slot, and the generated constructor overloads make
     * `token` mutually exclusive with `client_id`/`client_secret`. When an OAuth
     * scheme is present we drive the shared token slot (and the inferred-auth token
     * endpoint) via `client_id`/`client_secret`, so the bearer scheme contributes no
     * separate `token` kwarg. If there is no OAuth scheme, the bearer token slot is
     * fed directly via a `token` callable.
     */
    private getAuthSchemeParams(
        scheme: FernIr.AuthScheme,
        options: { isEndpointSecurity: boolean; hasOAuthScheme: boolean }
    ): string[] {
        const { isEndpointSecurity, hasOAuthScheme } = options;
        const params: string[] = [];

        switch (scheme.type) {
            case "bearer":
                // With OAuth present the shared token slot is populated by the OAuth
                // provider (via client_id/client_secret) and the generated constructor
                // overloads make token mutually exclusive with client credentials, so
                // bearer adds nothing.
                if (hasOAuthScheme) {
                    break;
                }
                if (isEndpointSecurity) {
                    params.push(`        token=lambda: "test_token",`);
                } else {
                    // Bearer auth uses a token parameter
                    params.push(`        ${this.context.caseConverter.snakeSafe(scheme.token)}="test_token",`);
                }
                break;

            case "basic":
                // Basic auth uses username and password parameters (skip omitted fields).
                // Values must use hyphens ("test-username") to match mock-utils WireMock stubs.
                if (!scheme.usernameOmit) {
                    params.push(`        ${this.context.caseConverter.snakeSafe(scheme.username)}="test-username",`);
                }
                if (!scheme.passwordOmit) {
                    params.push(`        ${this.context.caseConverter.snakeSafe(scheme.password)}="test-password",`);
                }
                break;

            case "header":
                // Header auth uses a custom header parameter
                params.push(
                    `        ${this.context.caseConverter.snakeSafe(getNameFromWireValue(scheme.name))}="test_${this.context.caseConverter.snakeSafe(getNameFromWireValue(scheme.name))}",`
                );
                break;

            case "oauth":
                // OAuth uses either client credentials or a token provider. Under
                // endpoint-security we always take the client-credentials path so the
                // shared token slot and the inferred-auth token endpoint can both be
                // driven by client_id/client_secret.
                if (scheme.configuration?.type === "clientCredentials" || isEndpointSecurity) {
                    // For client credentials OAuth, use client_id and client_secret
                    params.push(`        client_id="test_client_id",`);
                    params.push(`        client_secret="test_client_secret",`);
                } else {
                    // For other OAuth types, use a token callback
                    params.push(`        token=lambda: "test_token",`);
                }
                break;

            case "inferred":
                // Inferred auth - use api_key instead of _token_getter_override
                params.push(`        api_key="test_api_key",`);
                break;
        }

        return params;
    }
}
