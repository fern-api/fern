import { AbstractDynamicSnippetsGeneratorContext, FernGeneratorExec } from '@fern-api/browser-compatible-base-generator'
import { FernIr } from '@fern-api/dynamic-ir-sdk'
import { TypescriptCustomConfigSchema, ts } from '@fern-api/typescript-ast'
import { constructNpmPackage, getNamespaceExport } from '@fern-api/typescript-browser-compatible-base'

import { DynamicTypeLiteralMapper } from './DynamicTypeLiteralMapper'
import { FilePropertyMapper } from './FilePropertyMapper'

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation
    public customConfig: TypescriptCustomConfigSchema | undefined
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper
    public filePropertyMapper: FilePropertyMapper
    public moduleName: string
    public namespaceExport: string

    constructor({
        ir,
        config
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation
        config: FernGeneratorExec.GeneratorConfig
    }) {
        super({ ir, config })
        this.ir = ir
        this.customConfig =
            config.customConfig != null ? (config.customConfig as TypescriptCustomConfigSchema) : undefined
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this })
        this.filePropertyMapper = new FilePropertyMapper({ context: this })
        this.moduleName = getModuleName({ config, customConfig: this.customConfig })
        this.namespaceExport = getNamespaceExport({
            organization: config.organization,
            workspaceName: config.workspaceName,
            namespaceExport: this.customConfig?.namespaceExport
        })
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        })
    }

    public getModuleImport(): ts.Reference.ModuleImport {
        return {
            type: 'named',
            moduleName: this.moduleName
        }
    }

    public getRootClientName(): string {
        return `${this.namespaceExport}Client`
    }

    public getPropertyName(name: FernIr.Name): string {
        if (this.customConfig?.retainOriginalCasing || this.customConfig?.noSerdeLayer) {
            return this.formatOriginalPropertyName(name.originalName)
        }
        return name.camelCase.unsafeName
    }

    public getMethodName(name: FernIr.Name): string {
        return name.camelCase.unsafeName
    }

    public getTypeName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): ts.Reference | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID)
        if (environmentName == null) {
            return undefined
        }
        return this.getEnvironmentsTypeReference(environmentName)
    }

    public getFullyQualifiedReference({ declaration }: { declaration: FernIr.dynamic.Declaration }): string {
        if (declaration.fernFilepath.allParts.length > 0) {
            return `${declaration.fernFilepath.allParts
                .map((val) => val.camelCase.unsafeName)
                .join('.')}.${this.getTypeName(declaration.name)}`
        }
        return `${this.getTypeName(declaration.name)}`
    }

    private getEnvironmentsTypeReference(name: FernIr.Name): ts.Reference {
        return ts.reference({
            name: `${this.namespaceExport}Environment`,
            importFrom: this.getModuleImport(),
            memberName: this.getTypeName(name)
        })
    }

    private formatOriginalPropertyName(value: string): string {
        if (value.includes('-')) {
            // For example, header names like the following:
            //
            // {
            //   "X-API-Version": "X-API-Version",
            //   body: "string"
            // }
            return `"${value}"`
        }
        return value
    }
}

function getModuleName({
    config,
    customConfig
}: {
    config: FernGeneratorExec.GeneratorConfig
    customConfig: TypescriptCustomConfigSchema | undefined
}): string {
    return (
        constructNpmPackage({
            generatorConfig: config,
            isPackagePrivate: customConfig?.private ?? false
        })?.packageName ?? config.organization
    )
}
