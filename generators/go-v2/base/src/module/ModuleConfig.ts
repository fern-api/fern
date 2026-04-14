export namespace ModuleConfig {
    export const FILENAME = "go.mod";

    export const DEFAULT: ModuleConfig = {
        path: "sdk",
        version: "1.21",
        imports: {
            "github.com/google/uuid": "v1.4.0",
            "github.com/stretchr/testify": "v1.7.0",
            "gopkg.in/yaml.v3": "v3.0.1"
        }
    };

    // Wiremock dependencies pinned to versions that still support go 1.23.
    // Only include these in go.mod when wire test Go files that import them are generated.
    export const WIREMOCK_IMPORTS: Record<string, string> = {
        "github.com/wiremock/wiremock-testcontainers-go": "v1.0.0-alpha-9",
        "github.com/wiremock/go-wiremock": "v1.14.0",
        // must pin go-wiremock indirect dependencies to later fixed versions
        "github.com/containerd/containerd": "v1.7.27"
    };
}

export interface ModuleConfig {
    path: string;
    version?: string;
    imports?: Record<string, string>;
}
