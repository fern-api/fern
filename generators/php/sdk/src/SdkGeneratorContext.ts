import { DeclaredErrorName, HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import { AbstractPhpGeneratorContext, FileLocation } from "@fern-api/php-codegen";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { AsIsFiles, php } from "@fern-api/php-codegen";
import { camelCase, upperFirst } from "lodash-es";
import { RawClient } from "./core/RawClient";
import { GuzzleClient } from "./external/GuzzleClient";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { ErrorId, ErrorDeclaration } from "@fern-fern/ir-sdk/api";
import { TYPES_DIRECTORY, ERRORS_DIRECTORY } from "./constants";

export class SdkGeneratorContext extends AbstractPhpGeneratorContext<SdkCustomConfigSchema> {
    public guzzleClient: GuzzleClient;
    public rawClient: RawClient;
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.guzzleClient = new GuzzleClient(this);
        this.rawClient = new RawClient(this);
    }

    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        return service;
    }

    public getErrorDeclarationOrThrow(errorId: ErrorId): ErrorDeclaration {
        const error = this.ir.errors[errorId];
        if (error == null) {
            throw new Error(`Error with id ${errorId} not found`);
        }
        return error;
    }

    public getRootClientClassName(): string {
        if (this.customConfig["client-class-name"] != null) {
            return this.customConfig["client-class-name"];
        }
        return this.getComputedClientName();
    }

    public getClientOptionsParameterName(): string {
        return "$clientOptions";
    }

    public getClientOptionsType(): php.Type {
        return php.Type.map(php.Type.string(), php.Type.mixed());
    }

    private getComputedClientName(): string {
        return `${upperFirst(camelCase(this.config.organization))}Client`;
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore, AsIsFiles.PhpStanNeon, AsIsFiles.PhpUnitXml];
    }

    public getCoreAsIsFiles(): string[] {
        return [AsIsFiles.BaseApiRequest, AsIsFiles.HttpMethod, AsIsFiles.JsonApiRequest, AsIsFiles.RawClient];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [AsIsFiles.RawClientTest];
    }

    public getLocationForTypeId(typeId: string): FileLocation {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getFileLocation(typeDeclaration.name.fernFilepath, TYPES_DIRECTORY);
    }

    public getLocationForHttpService(serviceId: string): FileLocation {
        const httpService = this.getHttpServiceOrThrow(serviceId);
        return this.getFileLocation(httpService.name.fernFilepath);
    }

    public getLocationForRequestWrapper(serviceId: string): FileLocation {
        const httpService = this.getHttpServiceOrThrow(serviceId);
        return this.getFileLocation(httpService.name.fernFilepath);
    }

    public getLocationForError(errorId: ErrorId): FileLocation {
        const errorDeclaration = this.getErrorDeclarationOrThrow(errorId);
        return this.getFileLocation(errorDeclaration.name.fernFilepath, ERRORS_DIRECTORY);
    }
}
