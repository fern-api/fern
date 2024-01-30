import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
import { ClassReferenceFactory, Class_, GeneratedRubyFile, Module_ } from "@fern-api/ruby-codegen";
import {
    HttpService,
    IntermediateRepresentation,
    Package,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeDeclaration,
    TypeId
} from "@fern-fern/ir-sdk/api";
import {
    ClientClassPair,
    generateEnvironmentConstants,
    generateRequestClients,
    generateRootPackage,
    generateRubyPathTemplate,
    generateService,
    generateSubpackage,
    getDefaultEnvironmentUrl
} from "./AbstractionUtilities";
import { HeadersGenerator } from "./utils/HeadersGenerator";
import { RequestOptions } from "./utils/RequestOptionsClass";

// TODO: This (as an abstract class) will probably be used across CLIs
export class ClientsGenerator {
    private types: Map<TypeId, TypeDeclaration>;
    private services: Map<ServiceId, HttpService>;
    private subpackages: Map<SubpackageId, Subpackage>;
    private gc: GeneratorContext;
    private irBasePath: string;

    private clientName: string;
    private gemName: string;
    private sdkVersion: string | undefined;
    private intermediateRepresentation: IntermediateRepresentation;
    private crf: ClassReferenceFactory;
    private headersGenerator: HeadersGenerator;

    // TODO: should this be an object instead of a string
    private defaultEnvironment: string | undefined;

    constructor(
        gemName: string,
        clientName: string,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        sdkVersion: string | undefined
    ) {
        this.types = new Map();

        this.gc = generatorContext;
        this.sdkVersion = sdkVersion;
        this.intermediateRepresentation = intermediateRepresentation;
        this.clientName = clientName;
        this.gemName = gemName;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`[TESTING] Found this many types: ${intermediateRepresentation.types.length}`);
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }

        this.services = new Map(Object.entries(intermediateRepresentation.services));
        this.subpackages = new Map(Object.entries(intermediateRepresentation.subpackages));
        this.crf = new ClassReferenceFactory(this.types);
        this.headersGenerator = new HeadersGenerator(
            this.intermediateRepresentation.headers,
            this.crf,
            this.intermediateRepresentation.auth
        );

        this.defaultEnvironment = getDefaultEnvironmentUrl(this.intermediateRepresentation.environments);
        this.irBasePath = generateRubyPathTemplate(
            this.intermediateRepresentation.pathParameters,
            this.intermediateRepresentation.basePath
        );
    }

    public generateFiles(): GeneratedRubyFile[] {
        const clientFiles: GeneratedRubyFile[] = [];

        let environmentClass: Class_ | undefined;
        if (this.intermediateRepresentation.environments !== undefined) {
            environmentClass = generateEnvironmentConstants(this.intermediateRepresentation.environments);
            const environmentsModule = Module_.wrapInModules(this.clientName, environmentClass);
            clientFiles.push(
                new GeneratedRubyFile({
                    rootNode: environmentsModule,
                    directoryPrefix: RelativeFilePath.of("."),
                    name: "environment"
                })
            );
        }

        const requestOptionsClass = new RequestOptions({ headersGenerator: this.headersGenerator });
        const [syncClientClass, asyncClientClass] = generateRequestClients(
            this.intermediateRepresentation.sdkConfig,
            this.clientName,
            this.sdkVersion,
            this.headersGenerator,
            environmentClass?.classReference,
            this.intermediateRepresentation.environments?.environments.type === "multipleBaseUrls",
            this.defaultEnvironment
        );
        const requestsModule = Module_.wrapInModules(this.clientName, [
            syncClientClass,
            asyncClientClass,
            requestOptionsClass
        ]);
        clientFiles.push(
            new GeneratedRubyFile({
                rootNode: requestsModule,
                directoryPrefix: RelativeFilePath.of("."),
                name: "requests"
            })
        );

        const subpackageClassReferences = new Map<SubpackageId, ClientClassPair>();
        // 1. Generate service files, these are the classes that query the endpoints
        // and do the heavy lifting for API calls. While we iterate over endpoints here,
        // we should also generate an Example object, with a client and a function invocation (takes in an IR example).

        // 2. Generate package-level files, this exists just to get dot-access functional.
        // These classes just hold instance variables of instantiated service clients.
        function getServiceClasses(
            packageId: SubpackageId,
            package_: Package,
            services: Map<ServiceId, HttpService>,
            clientName: string,
            gemName: string,
            crf: ClassReferenceFactory,
            irBasePath: string
        ): ClientClassPair {
            if (package_.service === undefined) {
                throw new Error("Calling getServiceClasses without a service defined within the subpackage.");
            }
            const service = services.get(package_.service);
            if (service === undefined) {
                throw new Error(`Service ${package_.service} was not defined within in the IR`);
            }

            const serviceClasses = generateService(
                service,
                syncClientClass.classReference,
                asyncClientClass.classReference,
                crf,
                requestOptionsClass,
                irBasePath
            );
            const serviceModule = Module_.wrapInModules(
                clientName,
                [serviceClasses.syncClientClass, serviceClasses.asyncClientClass],
                package_.fernFilepath
            );
            const serviceFile = new GeneratedRubyFile({
                rootNode: serviceModule,
                directoryPrefix: RelativeFilePath.of(gemName),
                location: package_.fernFilepath,
                name: "client"
            });

            clientFiles.push(serviceFile);
            subpackageClassReferences.set(packageId, serviceClasses);
            return serviceClasses;
        }

        function getSubpackageClasses(
            packageId: SubpackageId,
            package_: Package,
            services: Map<ServiceId, HttpService>,
            subpackages: Map<SubpackageId, Subpackage>,
            clientName: string,
            gemName: string,
            crf: ClassReferenceFactory,
            irBasePath: string
        ): ClientClassPair | undefined {
            if (package_.service !== undefined) {
                return getServiceClasses(packageId, package_, services, clientName, gemName, crf, irBasePath);
            } else {
                // We create these subpackage files to support dot access for service clients,
                // if the package has no services then this isn't necessary.
                if (package_.hasEndpointsInTree) {
                    const classPairs: ClientClassPair[] = package_.subpackages
                        .map((subpackageId) => {
                            const subpackage = subpackages.get(subpackageId);
                            if (subpackage === undefined) {
                                throw new Error(`Subpackage ${subpackageId} was not defined within in the IR`);
                            }

                            const classPair = subpackageClassReferences.get(subpackageId);
                            if (classPair === undefined) {
                                return getSubpackageClasses(
                                    subpackageId,
                                    subpackage,
                                    services,
                                    subpackages,
                                    clientName,
                                    gemName,
                                    crf,
                                    irBasePath
                                );
                            }
                            return classPair;
                        })
                        .filter((cp) => cp !== undefined)
                        .map((cp) => cp!);

                    const subpackageClasses = generateSubpackage(
                        package_,
                        syncClientClass.classReference,
                        asyncClientClass.classReference,
                        classPairs.map((cp) => cp.syncClientClass),
                        classPairs.map((cp) => cp.asyncClientClass)
                    );

                    const subpackageModule = Module_.wrapInModules(
                        clientName,
                        [subpackageClasses.syncClientClass, subpackageClasses.asyncClientClass],
                        package_.fernFilepath
                    );
                    const subpackageFile = new GeneratedRubyFile({
                        rootNode: subpackageModule,
                        directoryPrefix: RelativeFilePath.of(gemName),
                        location: package_.fernFilepath,
                        name: "client"
                    });
                    clientFiles.push(subpackageFile);
                    subpackageClassReferences.set(packageId, subpackageClasses);

                    return subpackageClasses;
                }
                return;
            }
        }

        Array.from(this.subpackages.entries()).forEach(([packageId, package_]) =>
            getSubpackageClasses(
                packageId,
                package_,
                this.services,
                this.subpackages,
                this.clientName,
                this.gemName,
                this.crf,
                this.irBasePath
            )
        );

        // 3. Generate main file, this is what people import while leveraging the gem.
        const rootSubpackageClasses = this.intermediateRepresentation.rootPackage.subpackages
            .map((sp) => subpackageClassReferences.get(sp))
            .filter((cp) => cp !== undefined)
            .map((cp) => cp!);
        // TODO: this should also exist in some form for the model gen to consolidate imports
        clientFiles.push(
            generateRootPackage(
                this.gemName,
                this.clientName,
                syncClientClass,
                asyncClientClass,
                requestOptionsClass,
                this.crf,
                rootSubpackageClasses.map((sp) => sp.syncClientClass),
                rootSubpackageClasses.map((sp) => sp.asyncClientClass),
                this.irBasePath,
                this.services.get(this.intermediateRepresentation.rootPackage.service ?? "")
            )
        );

        // TODO: Consider making Class_ + ClassReference and Function_ + Function invocation
        // follow a data model thats: ObjectDefinition, ObjectReference, ObjectInvocation(.withExample)
        return clientFiles;
    }
}
