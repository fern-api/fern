import { Logger } from "@fern-api/logger";

export const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
export const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
export const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/ir.json`;
export const PROTOBUF_SHELL_PROXY_FILENAME = "protoc-gen-fern";
export const PROTOBUF_EXPORT_CONFIG_V1 = `version: v1
`;
export const PROTOBUF_EXPORT_CONFIG_V2 = `version: v2
`;
export const PROTOBUF_YAML_V1 = `version: v1
deps:
  - buf.build/googleapis/googleapis
  - buf.build/bufbuild/protovalidate
`;
export const PROTOBUF_YAML_V2 = `version: v2
deps:
  - buf.build/googleapis/googleapis
  - buf.build/bufbuild/protovalidate
`;
export const PROTOBUF_GEN_CONFIG = `version: v2
plugins:
  - local: ["bash", "./protoc-gen-fern"]
    out: output
    strategy: all
    include_imports: true
    include_wkt: true
`;

export const PROTOBUF_MODULE_PACKAGE_JSON = `{
    "name": "temp-protoc-gen-fern",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
        "@bufbuild/protobuf": "^2.2.5",
        "@bufbuild/protoplugin": "2.2.5"
    }
}
`;

export const PROTOBUF_SHELL_PROXY = `#!/usr/bin/env bash
fern protoc-gen-fern "$@"
`;

export const createEmptyProtobufLogger = (): Logger => {
    return {
        // biome-ignore-start lint/suspicious/noEmptyBlockStatements: allow
        disable: () => {},
        enable: () => {},
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        log: () => {}
        // biome-ignore-end lint/suspicious/noEmptyBlockStatements: allow
    };
};

export type MaybeValid<T> = Valid<T> | Invalid;

export interface Valid<T> {
    ok: true;
    value: T;
}

export interface Invalid {
    ok: false;
    errors: ValidationError[];
}

export interface ValidationError {
    path: string[];
    message: string;
}
