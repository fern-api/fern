export namespace ModuleConfig {
    export const FILENAME = "go.mod";

    export const DEFAULT: ModuleConfig = {
        path: "sdk",
        version: "1.18",
        imports: {
            "github.com/google/uuid": "v1.4.0",
            "github.com/stretchr/testify": "v1.7.0",
            "gopkg.in/yaml.v3": "v3.0.1",
            // must pin wiremock dependencies to versions that still support go 1.23
            "github.com/wiremock/wiremock-testcontainers-go": "v1.0.0-alpha-9",
            "github.com/wiremock/go-wiremock": "v1.14.0"
        }
    };
}

export interface ModuleConfig {
    path: string;
    version?: string;
    imports?: Record<string, string>;
}
