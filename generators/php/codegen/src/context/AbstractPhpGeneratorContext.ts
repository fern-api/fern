import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import {
    IntermediateRepresentation,
    Literal,
    Name,
    TypeReference,
    TypeId,
    TypeDeclaration,
    Subpackage,
    SubpackageId,
    FernFilepath
} from "@fern-fern/ir-sdk/api";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { PhpProject } from "../project";
import { camelCase, upperFirst } from "lodash-es";
import { PhpTypeMapper } from "./PhpTypeMapper";
import { AsIsFiles } from "../AsIs";
import { RelativeFilePath } from "@fern-api/fs-utils";

export interface FileLocation {
    namespace: string;
    directory: RelativeFilePath;
}

export abstract class AbstractPhpGeneratorContext<
    CustomConfig extends BasePhpCustomConfigSchema
> extends AbstractGeneratorContext {
    private rootNamespace: string;
    public readonly phpTypeMapper: PhpTypeMapper;
    public readonly project: PhpProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.rootNamespace = this.customConfig.namespace ?? upperFirst(camelCase(`${this.config.organization}`));
        this.phpTypeMapper = new PhpTypeMapper(this);
        this.project = new PhpProject({
            context: this,
            name: this.rootNamespace
        });
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage with id ${subpackageId} not found`);
        }
        return subpackage;
    }

    public getClassName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getRootNamespace(): string {
        return this.rootNamespace;
    }

    public getTestsNamespace(): string {
        return `${this.rootNamespace}\\Tests`;
    }

    public getCoreNamespace(): string {
        return `${this.rootNamespace}\\Core`;
    }

    public getCoreTestsNamespace(): string {
        return `${this.rootNamespace}\\Tests\\Core`;
    }

    public getLiteralAsString(literal: Literal): string {
        return literal.type === "string" ? `"${literal.string}"` : literal.boolean ? '"true"' : '"false"';
    }

    public isOptional(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                return typeReference.container.type === "optional";
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isOptional(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return false;
        }
    }

    public maybeLiteral(typeReference: TypeReference): Literal | undefined {
        if (typeReference.type === "container" && typeReference.container.type === "literal") {
            return typeReference.container.literal;
        }
        return undefined;
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.getTypeDeclaration(typeId);
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return typeDeclaration;
    }

    public getTypeDeclaration(typeId: TypeId): TypeDeclaration | undefined {
        return this.ir.types[typeId];
    }

    public abstract getRawAsIsFiles(): string[];

    public abstract getCoreAsIsFiles(): string[];

    public abstract getCoreTestAsIsFiles(): string[];

    public getCoreSerializationAsIsFiles(): string[] {
        return [
            AsIsFiles.ArrayType,
            AsIsFiles.Constant,
            AsIsFiles.DateType,
            AsIsFiles.JsonProperty,
            AsIsFiles.SerializableType,
            AsIsFiles.Union
        ];
    }

    public getCoreSerializationTestAsIsFiles(): string[] {
        return [
            AsIsFiles.DateArrayTypeTest,
            AsIsFiles.EmptyArraysTest,
            AsIsFiles.InvalidTypesTest,
            AsIsFiles.MixedDateArrayTypeTest,
            AsIsFiles.NestedUnionArrayTypeTest,
            AsIsFiles.NullableArrayTypeTest,
            AsIsFiles.NullPropertyTypeTest,
            AsIsFiles.ScalarTypesTest,
            AsIsFiles.TestTypeTest,
            AsIsFiles.UnionArrayTypeTest
        ];
    }

    public abstract getLocationForTypeId(typeId: TypeId): FileLocation;

    protected getFileLocation(filepath: FernFilepath, suffix?: string): FileLocation {
        let parts = [this.getRootNamespace(), ...filepath.allParts.map((path) => path.pascalCase.safeName)];
        parts = suffix != null ? [...parts, suffix] : parts;
        return {
            namespace: parts.join("\\"),
            directory: RelativeFilePath.of(parts.slice(1).join("/"))
        };
    }
}
