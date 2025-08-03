import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertDefined } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import {
    FernFilepath,
    HttpService,
    IntermediateRepresentation,
    Package,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeDeclaration,
    TypeId
} from "@fern-fern/ir-sdk/api";

import { AsIsFileDefinition, AsIsFiles } from "../AsIs";
import { SwiftProject } from "../project";

export abstract class AbstractSwiftGeneratorContext<
    CustomConfig extends BaseSwiftCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: SwiftProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new SwiftProject({ context: this });
    }

    public get packageName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get libraryName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get targetName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get rootClientName(): string {
        return `${this.ir.apiName.pascalCase.unsafeName}Client`;
    }

    public get environmentEnumName(): string {
        return `${this.ir.apiName.pascalCase.unsafeName}Environment`;
    }

    public get schemasDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Schemas");
    }

    public get requestsDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Requests");
    }

    public getSubClientName(subpackage: Subpackage): string {
        return `${subpackage.name.pascalCase.unsafeName}Client`;
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        assertDefined(typeDeclaration, `Type declaration with the id '${typeId}' not found`);
        return typeDeclaration;
    }

    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        assertDefined(service, `Service with the id '${serviceId}' not found`);
        return service;
    }

    public getSubpackagesOrThrow(packageOrSubpackage: Package | Subpackage): Subpackage[] {
        return packageOrSubpackage.subpackages.map((subpackageId) => {
            return this.getSubpackageOrThrow(subpackageId);
        });
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        assertDefined(subpackage, `Subpackage with the id '${subpackageId}' not found`);
        return subpackage;
    }

    public getDirectoryForFernFilepath(fernFilepath: FernFilepath): string {
        return RelativeFilePath.of([...fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/"));
    }

    public getCoreAsIsFiles(): AsIsFileDefinition[] {
        return Object.values(AsIsFiles);
    }
}
