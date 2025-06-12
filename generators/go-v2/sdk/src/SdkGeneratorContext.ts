import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractGoGeneratorContext, FileLocation, go } from "@fern-api/go-ast";
import { GoProject } from "@fern-api/go-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { HttpEndpoint, IntermediateRepresentation, Name, SdkRequestWrapper, ServiceId } from "@fern-fern/ir-sdk/api";

import { GoGeneratorAgent } from "./GoGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class SdkGeneratorContext extends AbstractGoGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: GoGeneratorAgent;
    public readonly project: GoProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new GoProject({ context: this });
        this.generatorAgent = new GoGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir
        });
    }

    public getRequestWrapperTypeReference(serviceId: ServiceId, requestName: Name): go.TypeReference {
        return go.typeReference({
            name: this.getClassName(requestName),
            importPath: this.getLocationForWrappedRequest(serviceId).importPath
        });
    }

    private getLocationForWrappedRequest(serviceId: ServiceId): FileLocation {
        const httpService = this.getHttpServiceOrThrow(serviceId);
        return this.getFileLocation(httpService.name.fernFilepath);
    }

    public shouldSkipWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: HttpEndpoint;
        wrapper: SdkRequestWrapper;
    }): boolean {
        return (
            (wrapper.onlyPathParameters ?? false) && !this.includePathParametersInWrappedRequest({ endpoint, wrapper })
        );
    }

    public includePathParametersInWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: HttpEndpoint;
        wrapper: SdkRequestWrapper;
    }): boolean {
        const inlinePathParameters = this.customConfig.inlinePathParameters;
        if (inlinePathParameters == null) {
            return false;
        }
        const wrapperShouldIncludePathParameters = wrapper.includePathParameters ?? false;
        return endpoint.allPathParameters.length > 0 && inlinePathParameters && wrapperShouldIncludePathParameters;
    }

    public accessRequestProperty({
        requestParameterName,
        propertyName
    }: {
        requestParameterName: Name;
        propertyName: Name;
    }): string {
        const requestParameter = this.getParameterName(requestParameterName);
        return `${requestParameter}.${this.getFieldName(propertyName)}`;
    }
}
