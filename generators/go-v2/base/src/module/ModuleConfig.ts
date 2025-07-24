export namespace ModuleConfig {
    export const FILENAME = "go.mod";

    export const DEFAULT: ModuleConfig = {
        path: "sdk",
        version: "1.18",
        imports: {
            "github.com/google/uuid": "v1.4.0",
            "github.com/stretchr/testify": "v1.7.0",
            "gopkg.in/yaml.v3": "v3.0.1"
        }
    };
}

export interface ModuleConfig {
    path: string;
    version?: string;
    imports?: Record<string, string>;
}
