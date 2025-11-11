import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BasePhpCustomConfigSchema, getSafeClassName, php } from "@fern-api/php-codegen";
import { camelCase, upperFirst } from "lodash-es";

import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

const RESERVED_METHOD_NAMES = ["use", "clone", "list"];
const REQUEST_NAMESPACE = "Requests";
const TYPES_NAMESPACE = "Types";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BasePhpCustomConfigSchema | undefined;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;
    public rootNamespace: string;
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
            config.customConfig != null ? (config.customConfig as BasePhpCustomConfigSchema) : undefined;
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
        this.rootNamespace = getRootNamespace({
            organization: config.organization,
            namespaceOverride: this.customConfig?.namespace
        });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        });
    }

    public getParameterName(name: FernIr.Name): string {
        return this.prependUnderscoreIfNeeded(name.camelCase.unsafeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        return this.prependUnderscoreIfNeeded(name.camelCase.unsafeName);
    }

    public getMethodName(name: FernIr.Name): string {
        // TODO: Propogate reserved keywords through IR via CasingsGenerator.
        const unsafeName = name.camelCase.unsafeName;
        if (RESERVED_METHOD_NAMES.includes(unsafeName)) {
            return unsafeName;
        }
        return name.camelCase.safeName;
    }

    public getClassName(name: FernIr.Name): string {
        return getSafeClassName(name.pascalCase.safeName);
    }

    public getRootClientClassName(): string {
        if (this.customConfig?.clientName != null) {
            return this.customConfig.clientName;
        }
        if (this.customConfig?.["client-class-name"] != null) {
            return this.customConfig?.["client-class-name"];
        }
        return this.getComputedClientName();
    }

    public getEnvironmentsClassReference(): php.ClassReference {
        return php.classReference({
            name: "Environments",
            namespace: this.rootNamespace
        });
    }

    public getRequestNamespace(fernFilepath: FernIr.dynamic.FernFilepath): string {
        return this.getNamespace(fernFilepath, REQUEST_NAMESPACE);
    }

    public getTypesNamespace(fernFilepath: FernIr.dynamic.FernFilepath): string {
        return this.getNamespace(fernFilepath, TYPES_NAMESPACE);
    }

    public getNamespace(fernFilepath: FernIr.dynamic.FernFilepath, suffix?: string): string {
        let parts = fernFilepath.allParts.map((path) => path.pascalCase.safeName);
        parts = suffix != null ? [...parts, suffix] : parts;
        return [this.rootNamespace, ...parts].join("\\");
    }

    public getEnvironmentClassAccessFromID(environmentID: string): php.AstNode | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return php.codeblock((writer) => {
            writer.writeNode(this.getEnvironmentClassReference(environmentName));
            writer.write("::");
            writer.write(this.getClassName(environmentName));
        });
    }

    public getEnvironmentClassReference(name: FernIr.Name): php.ClassReference {
        return php.classReference({
            name: "Environments",
            namespace: this.rootNamespace
        });
    }

    private prependUnderscoreIfNeeded(input: string): string {
        // https://www.php.net/manual/en/language.variables.basics.php
        if (!/^[a-zA-Z_]/.test(input)) {
            return `_${input}`;
        }
        return input;
    }

    private getComputedClientName(): string {
        return `${this.getOrganizationPascalCase()}Client`;
    }

    private getOrganizationPascalCase(): string {
        return `${upperFirst(camelCase(this.config.organization))}`;
    }
}

function getRootNamespace({
    organization,
    namespaceOverride
}: {
    organization: string;
    namespaceOverride?: string;
}): string {
    return namespaceOverride ?? `${upperFirst(camelCase(organization))}`;
}
