import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRubyGeneratorContext } from "@fern-api/ruby-ast";
import { AsIsFiles, RubyProject } from "@fern-api/ruby-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { HttpService, IntermediateRepresentation, ServiceId, Subpackage, SubpackageId, TypeId } from "@fern-fern/ir-sdk/api";

import { RelativeFilePath } from "@fern-api/path-utils";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

const ROOT_TYPES_FOLDER = "types";

export class SdkGeneratorContext extends AbstractRubyGeneratorContext<SdkCustomConfigSchema> {
    public readonly project: RubyProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new RubyProject({ context: this });
    }

    public getLocationForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        if (typeDeclaration.name.fernFilepath.allParts.length === 0) {
            return RelativeFilePath.of(["lib", this.getRootFolderName(), ROOT_TYPES_FOLDER].join("/"));
        }
        return RelativeFilePath.of(
            ["lib", this.getRootFolderName(), ...typeDeclaration.name.fernFilepath.allParts.map((path) => path.snakeCase.safeName)].join("/")
        );
    }

    public getLocationForSubpackageId(subpackageId: SubpackageId): RelativeFilePath {
        const subpackage = this.getSubpackageOrThrow(subpackageId);
        return RelativeFilePath.of(
            ["lib", this.getRootFolderName(), ...subpackage.fernFilepath.allParts.map((path) => path.snakeCase.safeName)].join("/")
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
