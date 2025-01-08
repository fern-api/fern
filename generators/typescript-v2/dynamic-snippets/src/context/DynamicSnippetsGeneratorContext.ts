import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Severity
} from "@fern-api/browser-compatible-base-generator";
import { assertNever, keys } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { constructNpmPackage, getNamespaceExport } from "@fern-api/typescript-browser-compatible-base";

import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: TypescriptCustomConfigSchema | undefined;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public moduleName: string;
    public namespaceExport: string;

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
            config.customConfig != null ? (config.customConfig as TypescriptCustomConfigSchema) : undefined;
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.moduleName = getModuleName({ config, customConfig: this.customConfig });
        this.namespaceExport = getNamespaceExport({
            organization: config.organization,
            workspaceName: config.workspaceName,
            namespaceExport: this.customConfig?.namespaceExport
        });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        });
    }

    public getModuleImport(): ts.Reference.ModuleImport {
        return {
            type: "named",
            moduleName: this.moduleName
        };
    }

    public getRootClientName(): string {
        return `${this.namespaceExport}Client`;
    }

    public getPropertyName(name: FernIr.Name): string {
        if (this.customConfig?.retainOriginalCasing || this.customConfig?.noSerdeLayer) {
            return name.originalName;
        }
        return name.camelCase.safeName;
    }

    public getMethodName(name: FernIr.Name): string {
        return name.camelCase.unsafeName;
    }

    public getTypeName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName;
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): ts.Reference | undefined {
        if (this.ir.environments == null) {
            return undefined;
        }
        const environments = this.ir.environments.environments;
        switch (environments.type) {
            case "singleBaseUrl": {
                const environment = environments.environments.find((env) => env.id === environmentID);
                if (environment == null) {
                    return undefined;
                }
                return this.getEnvironmentsTypeReference(environment.name);
            }
            case "multipleBaseUrls": {
                const environment = environments.environments.find((env) => env.id === environmentID);
                if (environment == null) {
                    return undefined;
                }
                return this.getEnvironmentsTypeReference(environment.name);
            }
        }
    }

    private getEnvironmentsTypeReference(name: FernIr.Name): ts.Reference {
        return ts.reference({
            name: `${this.namespaceExport}Environments`,
            importFrom: this.getModuleImport(),
            memberName: this.getTypeName(name)
        });
    }
}

function getModuleName({
    config,
    customConfig
}: {
    config: FernGeneratorExec.GeneratorConfig;
    customConfig: TypescriptCustomConfigSchema | undefined;
}): string {
    return (
        constructNpmPackage({
            generatorConfig: config,
            isPackagePrivate: customConfig?.private ?? false
        })?.packageName ?? config.organization
    );
}
