export { validateSchema } from "./commons/validateSchema";
export * from "./commons/WithoutQuestionMarks";
export { GeneratorName } from "./generators-yml/GeneratorName";
export * from "./getFernDirectory";

import * as localDependenciesYml from "./dependencies-yml";
import * as localDocsYml from "./docs-yml";
import * as localFernConfigJson from "./fern-config-json";
import * as localGeneratorsYml from "./generators-yml";

import { dependenciesYml as configDependenciesYml } from "@fern-api/configuration";
import { docsYml as configDocsYml } from "@fern-api/configuration";
import { fernConfigJson as configFernConfigJson } from "@fern-api/configuration";
import { generatorsYml as configGeneratorsYml } from "@fern-api/configuration";

// Export everything from @fern-api/configuration so that consumers
// can simply use @fern-api/configuration-loader on its own.
export * from "@fern-api/configuration";
export namespace dependenciesYml {
    export const { ...config } = configDependenciesYml;
    export const { ...local } = localDependenciesYml;
}
export namespace docsYml {
    export const { ...config } = configDocsYml;
    export const { ...local } = localDocsYml;
}
export namespace fernConfigJson {
    export const { ...config } = configFernConfigJson;
    export const { ...local } = localFernConfigJson;
}
export namespace generatorsYml {
    export const { ...config } = configGeneratorsYml;
    export const { ...local } = localGeneratorsYml;
}