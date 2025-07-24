import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRubyGeneratorContext } from "@fern-api/ruby-ast";
import { RubyProject, AsIsFiles } from "@fern-api/ruby-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";

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

    public getCoreAsIsFiles(): string[] {
        const files = [
            // Errors
            AsIsFiles.ErrorsConstraint, AsIsFiles.ErrorsType, 
            
            // HTTP
            AsIsFiles.HttpBaseRequest, AsIsFiles.HttpRawClient,

            // JSON
            AsIsFiles.JsonRequest, 
            AsIsFiles.JsonSerializable, 
            
            // Multipart
            AsIsFiles.MultipartEncoder, 
            AsIsFiles.MultipartFormDataPart,
            AsIsFiles.MultipartFormData, 
            AsIsFiles.MultipartRequest, 
            
            // Types
            AsIsFiles.TypesModelField, AsIsFiles.TypesArray,
            AsIsFiles.TypesBoolean, AsIsFiles.TypesEnum, AsIsFiles.TypesHash, AsIsFiles.TypesModel, AsIsFiles.TypesType,
            AsIsFiles.TypesUnion, AsIsFiles.TypesUnknown, AsIsFiles.TypesUtils
        ];

        return files;
    }
}
