import { GeneratorNotificationService } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { ClassReference } from "@fern-api/ruby-ast/src/ast/ClassReference";
import { AbstractRubyGeneratorContext, AsIsFiles, RubyProject } from "@fern-api/ruby-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    HttpService,
    IntermediateRepresentation,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeDeclaration,
    TypeId
} from "@fern-fern/ir-sdk/api";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

const ROOT_TYPES_FOLDER = "types";

export class SdkGeneratorContext extends AbstractRubyGeneratorContext<SdkCustomConfigSchema> {
    public readonly project: RubyProject;
    public readonly endpointGenerator: EndpointGenerator;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig ?? {}, generatorNotificationService);
        this.project = new RubyProject({ context: this });
        this.endpointGenerator = new EndpointGenerator({ context: this });
    }

    public getRootFolderPath(): RelativeFilePath {
        return RelativeFilePath.of(["lib", this.getRootFolderName()].join("/"));
    }

    public getLocationForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return join(
            RelativeFilePath.of("lib"),
            RelativeFilePath.of(this.getRootFolderName()),
            ...this.snakeNames(typeDeclaration).map(RelativeFilePath.of),
            RelativeFilePath.of(this.typesDirName)
        );
    }

    public getClassReferenceForTypeId(typeId: TypeId): ruby.ClassReference {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return ruby.classReference({
            modules: this.getModuleNamesForTypeId(typeId),
            name: typeDeclaration.name.name.pascalCase.safeName
        });
    }

    public getFileNameForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return typeDeclaration.name.name.snakeCase.safeName + ".rb";
    }

    public getAllTypeDeclarations(): TypeDeclaration[] {
        return Object.values(this.ir.types);
    }

    public getModuleNamesForTypeId(typeId: TypeId): string[] {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return [this.getRootModule().name, ...this.pascalNames(typeDeclaration), this.getTypesModule().name];
    }

    public getModulesForTypeId(typeId: TypeId): ruby.Module_[] {
        const modules = this.getModuleNamesForTypeId(typeId);
        return modules.map((name) => ruby.module({ name }));
    }

    public getLocationForSubpackageId(subpackageId: SubpackageId): RelativeFilePath {
        const subpackage = this.getSubpackageOrThrow(subpackageId);
        return RelativeFilePath.of(
            [
                "lib",
                this.getRootFolderName(),
                ...subpackage.fernFilepath.allParts.map((path) => path.snakeCase.safeName)
            ].join("/")
        );
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage with id ${subpackageId} not found`);
        }
        return subpackage;
    }

    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        return service;
    }

    public getSubpackageForServiceId(serviceId: ServiceId): Subpackage {
        for (const [_, subpackage] of Object.entries(this.ir.subpackages)) {
            if (subpackage.service === serviceId) {
                return subpackage;
            }
        }
        throw new Error(`No subpackage found for service ${serviceId}`);
    }

    /**
     * Recursively checks if a subpackage has endpoints.
     * @param subpackage - The subpackage to check.
     * @returns True if the subpackage has endpoints, false otherwise.
     *
     * @remarks
     * The `hasEndpointInTree` member may not always be perfectly accurate.
     *
     * This method is a interim workaround that recursively checks all
     * subpackages in order to determine if the subpackage has endpoints.
     *
     * There may be other cases that this method does not handle (GRPC, etc?)
     */
    public subPackageHasEndpoints(subpackage: Subpackage): boolean {
        return (
            subpackage.hasEndpointsInTree ||
            subpackage.subpackages.some((pkg) => this.subPackageHasEndpoints(this.getSubpackageOrThrow(pkg)))
        );
    }

    public getRawClientClassReference(): ClassReference {
        return ruby.classReference({
            name: "RawClient",
            modules: [this.getRootModule().name, "Internal", "Http"],
            fullyQualified: true
        });
    }

    public getEnvironmentsClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: "Environment",
            modules: [this.getRootModule().name]
        });
    }

    public getRootClientClassName(): string {
        return `Client`;
    }

    public getReferenceToInternalJSONRequest(): ruby.ClassReference {
        return ruby.classReference({
            name: "Request",
            modules: [this.getRootModule().name, "Internal", "JSON"]
        });
    }

    public getReferenceToInternalMultipartRequest(): ruby.ClassReference {
        return ruby.classReference({
            name: "Request",
            modules: [this.getRootModule().name, "Internal", "Multipart"]
        });
    }

    public getReferenceToTypeId(typeId: TypeId): ruby.ClassReference {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return ruby.classReference({
            name: typeDeclaration.name.name.pascalCase.safeName,
            modules: [
                this.getRootModule().name,
                ...typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName),
                "Types"
            ]
        });
    }

    public getCoreAsIsFiles(): string[] {
        const files = [
            // Errors
            AsIsFiles.ErrorsConstraint,
            AsIsFiles.ErrorsType,

            // HTTP
            AsIsFiles.HttpBaseRequest,
            AsIsFiles.HttpRawClient,

            // JSON
            AsIsFiles.JsonRequest,
            AsIsFiles.JsonSerializable,

            // Multipart
            AsIsFiles.MultipartEncoder,
            AsIsFiles.MultipartFormDataPart,
            AsIsFiles.MultipartFormData,
            AsIsFiles.MultipartRequest,

            // Types
            AsIsFiles.TypesModelField,
            AsIsFiles.TypesArray,
            AsIsFiles.TypesBoolean,
            AsIsFiles.TypesEnum,
            AsIsFiles.TypesHash,
            AsIsFiles.TypesModel,
            AsIsFiles.TypesType,
            AsIsFiles.TypesUnion,
            AsIsFiles.TypesUnknown,
            AsIsFiles.TypesUtils
        ];

        return files;
    }
}
