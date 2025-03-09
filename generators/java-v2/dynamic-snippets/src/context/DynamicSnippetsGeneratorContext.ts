import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseJavaCustomConfigSchema, java } from "@fern-api/java-ast";

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

    public getJavaClassReferenceFromDeclaration({
        declaration
    }: {
        declaration: FernIr.dynamic.Declaration;
    }): java.ClassReference {
        return java.classReference({
            name: declaration.name.pascalCase.unsafeName,
            packageName: this.getTypePackageName(declaration.fernFilepath)
        });
    }

    public getTypePackageName(fernFilepath: FernIr.FernFilepath): string {
        return this.getPackageName(fernFilepath, "types");
    }

    public getPackageName(fernFilepath: FernIr.FernFilepath, suffix?: string): string {
        let parts = this.getPackageNameSegments(fernFilepath);
        parts = suffix != null ? [...parts, suffix] : parts;
        return [this.getPackagePrefix(), ...parts].join(".");
    }

    public getPackagePrefix(): string {
        return "TODO: Add package-prefix configuration";
    }

    private getPackageNameSegments(fernFilepath: FernIr.FernFilepath): string[] {
        // TODO: Add support for non-flat package layouts.
        const segments =
            this.customConfig?.["package-layout"] === "flat" ? fernFilepath.packagePath : fernFilepath.allParts;
        return segments.map((segment) => this.getPackageNameSegment(segment));
    }

    private getPackageNameSegment(name: FernIr.Name): string {
        return name.camelCase.safeName.toLowerCase();
    }
}
