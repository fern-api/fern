import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";

import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseJavaCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;

    constructor({
        ir,
        config
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super({ ir, config });
        this.ir = ir;
        this.customConfig =
            config.customConfig != null ? (config.customConfig as BaseJavaCustomConfigSchema) : undefined;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        });
    }

    public getClassName(name: FernIr.Name): string {
        return name.pascalCase.safeName;
    }

    public getPropertyName(name: FernIr.Name): string {
        return name.camelCase.safeName;
    }

    public getMethodName(name: FernIr.Name): string {
        return name.camelCase.safeName;
    }
}
