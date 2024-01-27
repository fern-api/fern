import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
import { ClassReferenceFactory, GeneratedRubyFile, Module_ } from "@fern-api/ruby-codegen";
import {
    HttpService,
    IntermediateRepresentation,
    ServiceId,
    Subpackage,
    TypeDeclaration,
    TypeId
} from "@fern-fern/ir-sdk/api";
import {
    generateEnvironmentConstants,
    generateRequestClients,
    generateRootPackage,
    generateSubPackage
} from "./AbstractionUtilities";
import { ServiceClass } from "./ast/ServiceClass";

// interface FernEnvironment {
//     id: string;
//     name: string;
//     urls: string | Map<string, string>;
// }

// TODO: This (as an abstract class) will probably be used across CLIs
export class ClientsGenerator {
    private types: Map<TypeId, TypeDeclaration>;
    private services: Map<ServiceId, HttpService>;
    private gc: GeneratorContext;

    private clientName: string;
    private gemName: string;
    private sdkVersion: string | undefined;
    private intermediateRepresentation: IntermediateRepresentation;
    private crf: ClassReferenceFactory;

    constructor(
        directoryPrefix: RelativeFilePath,
        gemName: string,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        sdkVersion: string | undefined
    ) {
        this.types = new Map();

        this.gc = generatorContext;
        this.sdkVersion = sdkVersion;
        this.intermediateRepresentation = intermediateRepresentation;
        this.clientName = directoryPrefix;
        this.gemName = gemName;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`[TESTING] Found this many types: ${intermediateRepresentation.types.length}`);
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }

        this.services = new Map(Object.entries(intermediateRepresentation.services));

        this.crf = new ClassReferenceFactory(this.types);
    }

    private generateService(service: HttpService, subpackage: Subpackage): GeneratedRubyFile {
        const serviceClass = new ServiceClass({ service, documentation: subpackage.docs });
        const rootNode = Module_.wrapInModules(this.clientName, serviceClass, service.name.fernFilepath, false);
        return new GeneratedRubyFile({
            rootNode,
            directoryPrefix: RelativeFilePath.of(this.clientName),
            name: service.name
        });
    }

    public generateFiles(): GeneratedRubyFile[] {
        const clientFiles: GeneratedRubyFile[] = [];
        // 1. Generate main file, this is what people import while leveraging the gem.
        // TODO: this should also exist in some form for the model gen to consolidate imports
        clientFiles.push(generateRootPackage(this.gemName, this.clientName, this.intermediateRepresentation, this.crf));
        if (this.intermediateRepresentation.environments !== undefined) {
            clientFiles.push(
                generateEnvironmentConstants(this.clientName, this.intermediateRepresentation.environments)
            );
        }
        clientFiles.push(
            generateRequestClients(this.intermediateRepresentation, this.crf, this.clientName, this.sdkVersion)
        );

        // 2. Generate package-level files, this exists just to get dot-access functional.
        // These classes just hold instance variables of instantiated service clients.

        // 3. Generate service files, these are the classes that query the endpoints
        // and do the heavy lifting for API calls. While we iterate over endpoints here,
        // we should also generate an Example object, with a client and a function invocation (takes in an IR example).
        Object.entries(this.intermediateRepresentation.subpackages).forEach(([_packageId, package_]) => {
            if (package_.service !== undefined) {
                const service = this.services.get(package_.service);
                if (service === undefined) {
                    throw new Error(`Service ${package_.service} was not defined within in the IR`);
                }
                clientFiles.push(this.generateService(service, package_));
            } else {
                // We create these subpackage files to support dot access for service clients,
                // if the package has no services then this isn't necessary.
                if (package_.hasEndpointsInTree) {
                    clientFiles.push(generateSubPackage(this.clientName, package_));
                }
            }
        });

        // TODO: Consider making Class_ + ClassReference and Function_ + Function invocation
        // follow a data model thats: ObjectDefinition, ObjectReference, ObjectInvocation(.withExample)
        return clientFiles;
    }
}
