import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseRubyCustomConfigSchema, ruby } from "@fern-api/ruby-ast";
import { upperFirst } from "lodash-es";

import { DynamicTypeLiteralMapper } from "./DynamicToLiteralMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseRubyCustomConfigSchema | undefined;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;

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
            config.customConfig != null ? (config.customConfig as BaseRubyCustomConfigSchema) : undefined;
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        });
    }

    public getRootClientClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: this.getRootClientClassName(),
            modules: [this.getRootModuleName()]
        });
    }

    public getRootClientClassName(): string {
        return "Client";
    }

    public getRootModuleName(): string {
        return upperFirst(this.customConfig?.clientModuleName ?? this.config.organization);
    }

    public isSingleEnvironmentID(
        environment: FernIr.dynamic.EnvironmentValues
    ): environment is FernIr.dynamic.EnvironmentId {
        return typeof environment === "string";
    }

    public isMultiEnvironmentValues(
        environment: FernIr.dynamic.EnvironmentValues
    ): environment is FernIr.dynamic.MultipleEnvironmentUrlValues {
        return typeof environment === "object";
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): ruby.AstNode | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return ruby.codeblock((writer) => {
            writer.writeNode(this.getEnvironmentClassReference());
            writer.write("::");
            writer.write(this.getEnumName(environmentName));
        });
    }

    public getEnvironmentClassReference(): ruby.AstNode {
        return ruby.classReference({
            name: "Environment",
            modules: [this.getRootModuleName()]
        });
    }

    public getEnumName(name: FernIr.Name): string {
        return this.getName(name.screamingSnakeCase.safeName);
    }

    public getMethodName(name: FernIr.Name): string {
        return this.getName(name.snakeCase.safeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        return this.getName(name.snakeCase.safeName);
    }

    private getName(name: string): string {
        return name;
    }
}
