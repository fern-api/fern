import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";

import { CasingsGenerator, constructCasingsGenerator } from "@fern-api/casings-generator";
import { FernFilepath, TypeReference } from "@fern-api/ir-sdk";
import { Logger } from "@fern-api/logger";
import { ErrorCollector } from "@fern-api/v2-importer-commons";

import { ProtobufSettings } from "./commons/ProtobufSettings";

export declare namespace Spec {
    export interface Args {
        spec: CodeGeneratorRequest;
        settings: ProtobufSettings;
        errorCollector: ErrorCollector;
        logger: Logger;
        generationLanguage: undefined;
        smartCasing: boolean;
        namespace?: string; // namespaces are at the package level --> no duplicate message/service names in the same package
        exampleGenerationArgs: undefined;
        generateV1Examples: boolean;
    }
}

/**
 * Context class for converting protobuf file descriptors to intermediate representations
 */
export class ProtobufConverterContext {
    public spec: CodeGeneratorRequest;
    public readonly settings: ProtobufSettings;
    public readonly errorCollector: ErrorCollector;
    public readonly logger: Logger;
    public readonly generationLanguage: undefined;
    public readonly smartCasing: boolean;
    public readonly casingsGenerator: CasingsGenerator;
    public readonly namespace?: string;
    public readonly exampleGenerationArgs: undefined;
    public readonly generateV1Examples: boolean;

    constructor(protected readonly args: Spec.Args) {
        this.spec = args.spec;
        this.settings = args.settings;
        this.errorCollector = args.errorCollector;
        this.logger = args.logger;
        this.generationLanguage = args.generationLanguage;
        this.smartCasing = args.smartCasing;
        this.namespace = args.namespace;
        this.casingsGenerator = constructCasingsGenerator({
            generationLanguage: args.generationLanguage,
            keywords: undefined,
            smartCasing: args.smartCasing
        });
        this.exampleGenerationArgs = args.exampleGenerationArgs;
        this.generateV1Examples = args.generateV1Examples;
    }

    public createFernFilepath(args: { name?: string } = {}): FernFilepath {
        return {
            allParts: [],
            packagePath: [],
            file: undefined
        };
    }
}
