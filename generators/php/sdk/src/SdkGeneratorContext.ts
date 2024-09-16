import { HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import { AbstractPhpGeneratorContext } from "@fern-api/php-codegen";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { AsIsFiles, php } from "@fern-api/php-codegen";
import { camelCase, upperFirst } from "lodash-es";
import { RawClient } from "./core/RawClient";
import { GuzzleClient } from "./external/GuzzleClient";

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
        return [
            AsIsFiles.BaseApiRequest,
            AsIsFiles.HttpMethod,
            AsIsFiles.JsonApiRequest,
            AsIsFiles.RawClient,
            ...this.getCoreSerializationAsIsFiles()
        ];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [AsIsFiles.RawClientTest, ...this.getCoreSerializationTestAsIsFiles()];
    }
}
