// import { Logger } from "@fern-api/logger";

// export const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
// export const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
// export const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/ir.json`;
// export const PROTOBUF_SHELL_PROXY_FILENAME = "protoc-gen-fern";
// export const PROTOC_GEN_FERN_PLUGIN_PATH =
//     "/Users/sahil/Fern/fern/packages/cli/generation/protoc-gen-fern/lib/protoc-gen-fern.js";

// export const PROTOBUF_GEN_CONFIG = `version: v2
// plugins:
//   - local: ["tsx", "protoc-gen-fern"]
//     out: output
//     strategy: all
// `;

// export const PROTOBUF_MODULE_PACKAGE_JSON = `{
//     "name": "temp-protoc-gen-fern",
//     "version": "1.0.0",
//     "type": "module",
//     "dependencies": {
//         "@bufbuild/protobuf": "^2.2.5",
//         "@bufbuild/protoplugin": "2.2.5"
//     }
// }
// `;

// export const PROTOBUF_SHELL_PROXY = `#!/usr/bin/env node
// import { runNodeJs } from "@bufbuild/protoplugin";

// import { protocGenFern } from "${PROTOC_GEN_FERN_PLUGIN_PATH}";

// runNodeJs(protocGenFern);
// `;

// // export const PROTOBUF_SHELL_PROXY = `#!/usr/bin/env bash
// // exec fern protoc-gen-fern
// // `;

// export const createEmptyProtobufLogger = (): Logger => {
//     return {
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         disable: () => {},
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         enable: () => {},
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         trace: () => {},
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         debug: () => {},
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         info: () => {},
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         warn: () => {},
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         error: () => {},
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         log: () => {}
//     };
// };

// export type MaybeValid<T> = Valid<T> | Invalid;

// export interface Valid<T> {
//     ok: true;
//     value: T;
// }

// export interface Invalid {
//     ok: false;
//     errors: ValidationError[];
// }

// export interface ValidationError {
//     path: string[];
//     message: string;
// }
