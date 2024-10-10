import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema";
import { IntermediateRepresentation } from "../generated/api";
import { FernGeneratorExec } from "@fern-api/generator-commons";
import { FernFilepath } from "../generated/api";
import { as } from "vitest/dist/chunks/reporters.C_zwCd4j";

export class Context {
    public config: FernGeneratorExec.config.GeneratorConfig;
    public customConfig: BaseGoCustomConfigSchema;
    public ir: IntermediateRepresentation;
    public rootImportPath: string;

    constructor({ ir, config }: { ir: IntermediateRepresentation; config: FernGeneratorExec.config.GeneratorConfig }) {
        this.ir = ir;
        this.config = config;
        this.customConfig = config.customConfig as BaseGoCustomConfigSchema;
        this.rootImportPath = this.customConfig.importPath ?? "github.com/acme/acme-go"; // TODO: This value will need to be required.
    }

    public getRecordOrThrow(value: unknown): Record<string, unknown> {
        if (typeof value === "object" && value != null) {
            return value as Record<string, unknown>;
        }
        throw new Error(`Expected object with key, value pairs but got: ${JSON.stringify(value)}`);
    }

    public getImportPath(fernFilepath: FernFilepath): string {
        const parts = fernFilepath.packagePath.map((path) => path.pascalCase.unsafeName.toLowerCase());
        return [this.rootImportPath, ...parts].join("/");
    }
}
