import { GeneratorContext } from "@fern-api/generator-commons";
import { ClassReferenceFactory, Class_, GeneratedRubyFile, LocationGenerator, Module_ } from "@fern-api/ruby-codegen";
import {
    HttpService,
    IntermediateRepresentation,
    Name,
    ObjectProperty,
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
import { FileUploadUtility } from "./utils/FileUploadUtility";
import { HeadersGenerator } from "./utils/HeadersGenerator";
import { IdempotencyRequestOptions } from "./utils/IdempotencyRequestOptionsClass";
import { RequestOptions } from "./utils/RequestOptionsClass";
import { RootImportsFile } from "./utils/RootImportsFile";

// TODO: This (as an abstract class) will probably be used across CLIs
export class ClientsGenerator {
    private types: Map<TypeId, TypeDeclaration>;
    private services: Map<ServiceId, HttpService>;
    private subpackages: Map<SubpackageId, Subpackage>;
    private gc: GeneratorContext;
    private irBasePath: string;
    private generatedClasses: Map<TypeId, Class_>;
    private flattenedProperties: Map<TypeId, ObjectProperty[]>;

    private clientName: string;
    private gemName: string;
    private sdkVersion: string | undefined;
    private hasFileBasedDependencies: boolean;
    private intermediateRepresentation: IntermediateRepresentation;
    private crf: ClassReferenceFactory;
    private headersGenerator: HeadersGenerator;
    private locationGenerator: LocationGenerator;

    // TODO: should this be an object instead of a string
    private defaultEnvironment: string | undefined;

    constructor(
        gemName: string,
        clientName: string,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        sdkVersion: string | undefined,
        generatedClasses: Map<TypeId, Class_>,
        flattenedProperties: Map<TypeId, ObjectProperty[]>,
        hasFileBasedDependencies: boolean
    ) {
        this.types = new Map();

        this.gc = generatorContext;
        this.sdkVersion = sdkVersion;
        this.intermediateRepresentation = intermediateRepresentation;
        this.clientName = clientName;
        this.gemName = gemName;
        this.hasFileBasedDependencies = hasFileBasedDependencies;

        this.generatedClasses = generatedClasses;
        this.flattenedProperties = flattenedProperties;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`Found ${intermediateRepresentation.types.length} types to generate`);
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }

        this.services = new Map(Object.entries(intermediateRepresentation.services));
        this.subpackages = new Map(Object.entries(intermediateRepresentation.subpackages));
        this.locationGenerator = new LocationGenerator(this.gemName);
        this.crf = new ClassReferenceFactory(this.types, this.locationGenerator);
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
                    fullPath: "environment"
                })
            );
        }

        const requestOptionsClass = new RequestOptions({ headersGenerator: this.headersGenerator });
        const idempotencyRequestOptionsClass = new IdempotencyRequestOptions({
            crf: this.crf,
            idempotencyHeaders: this.intermediateRepresentation.idempotencyHeaders,
            headersGenerator: this.headersGenerator
        });
        const [syncClientClass, asyncClientClass] = generateRequestClients(
            this.intermediateRepresentation.sdkConfig,
            this.clientName,
            this.sdkVersion,
            this.headersGenerator,
            environmentClass?.classReference,
            this.intermediateRepresentation.environments?.environments.type === "multipleBaseUrls",
            this.defaultEnvironment,
            this.hasFileBasedDependencies
        );
        const requestsModule = Module_.wrapInModules(this.clientName, [
            syncClientClass,
            asyncClientClass,
            requestOptionsClass,
            idempotencyRequestOptionsClass
        ]);

        clientFiles.push(
            new GeneratedRubyFile({
                rootNode: requestsModule,
                fullPath: "requests"
            })
        );

        const fileUtilityClass = new FileUploadUtility();
        if (this.hasFileBasedDependencies) {
            const fileUtilityModule = Module_.wrapInModules(this.clientName, fileUtilityClass);
            clientFiles.push(
                new GeneratedRubyFile({
                    rootNode: fileUtilityModule,
                    fullPath: `core/${fileUtilityClass.classReference.name}`
                })
            );
        }

        const subpackageClassReferences = new Map<SubpackageId, ClientClassPair>();
        const locationGenerator = this.locationGenerator;
        // 1. Generate service files, these are the classes that query the endpoints
        // and do the heavy lifting for API calls. While we iterate over endpoints here,
        // we should also generate an Example object, with a client and a function invocation (takes in an IR example).

        // 2. Generate package-level files, this exists just to get dot-access functional.
        // These classes just hold instance variables of instantiated service clients.
        function getServiceClasses(
            packageId: SubpackageId,
            subpackage: Subpackage,
            services: Map<ServiceId, HttpService>,
            clientName: string,
            crf: ClassReferenceFactory,
            irBasePath: string,
            generatedClasses: Map<TypeId, Class_>,
            flattenedProperties: Map<TypeId, ObjectProperty[]>
        ): ClientClassPair {
            if (subpackage.service === undefined) {
                throw new Error("Calling getServiceClasses without a service defined within the subpackage.");
            }
            const service = services.get(subpackage.service);
            if (service === undefined) {
                throw new Error(`Service ${subpackage.service} was not defined within in the IR`);
            }

            const serviceClasses = generateService(
                service,
                subpackage,
                syncClientClass.classReference,
                asyncClientClass.classReference,
                crf,
                requestOptionsClass,
                idempotencyRequestOptionsClass,
                irBasePath,
                generatedClasses,
                flattenedProperties,
                fileUtilityClass,
                locationGenerator
            );
            const serviceModule = Module_.wrapInModules(
                clientName,
                [serviceClasses.syncClientClass, serviceClasses.asyncClientClass],
                subpackage.fernFilepath,
                [],
                false
            );
            const serviceFile = new GeneratedRubyFile({
                rootNode: serviceModule,
                fullPath: locationGenerator.getLocationFromFernFilepath(subpackage.fernFilepath, "client")
            });

            clientFiles.push(serviceFile);
            subpackageClassReferences.set(packageId, serviceClasses);
            return serviceClasses;
        }

        function getSubpackageClasses(
            subpackageName: Name,
            packageId: SubpackageId,
            subpackage: Subpackage,
            services: Map<ServiceId, HttpService>,
            subpackages: Map<SubpackageId, Subpackage>,
            clientName: string,
            gemName: string,
            crf: ClassReferenceFactory,
            irBasePath: string,
            generatedClasses: Map<TypeId, Class_>,
            flattenedProperties: Map<TypeId, ObjectProperty[]>
        ): ClientClassPair | undefined {
            if (subpackage.service !== undefined) {
                return getServiceClasses(
                    packageId,
                    subpackage,
                    services,
                    clientName,
                    crf,
                    irBasePath,
                    generatedClasses,
                    flattenedProperties
                );
            } else {
                // We create these subpackage files to support dot access for service clients,
                // if the package has no services then this isn't necessary.
                if (subpackage.hasEndpointsInTree) {
                    const classPairs: ClientClassPair[] = subpackage.subpackages
                        .map((subpackageId) => {
                            const subpackage = subpackages.get(subpackageId);
                            if (subpackage === undefined) {
                                throw new Error(`Subpackage ${subpackageId} was not defined within in the IR`);
                            }

                            const classPair = subpackageClassReferences.get(subpackageId);
                            if (classPair === undefined) {
                                return getSubpackageClasses(
                                    subpackageName,
                                    subpackageId,
                                    subpackage,
                                    services,
                                    subpackages,
                                    clientName,
                                    gemName,
                                    crf,
                                    irBasePath,
                                    generatedClasses,
                                    flattenedProperties
                                );
                            }
                            return classPair;
                        })
                        .filter((cp) => cp !== undefined) as ClientClassPair[];

                    const subpackageClasses = generateSubpackage(
                        subpackageName,
                        subpackage,
                        syncClientClass.classReference,
                        asyncClientClass.classReference,
                        locationGenerator,
                        new Map(classPairs.map((cp) => [cp.subpackageName, cp.syncClientClass])),
                        new Map(classPairs.map((cp) => [cp.subpackageName, cp.asyncClientClass]))
                    );

                    const subpackageModule = Module_.wrapInModules(
                        clientName,
                        [subpackageClasses.syncClientClass, subpackageClasses.asyncClientClass],
                        subpackage.fernFilepath
                    );
                    const subpackageFile = new GeneratedRubyFile({
                        rootNode: subpackageModule,
                        fullPath: locationGenerator.getLocationFromFernFilepath(subpackage.fernFilepath, "client")
                    });
                    clientFiles.push(subpackageFile);
                    subpackageClassReferences.set(packageId, subpackageClasses);

                    return subpackageClasses;
                }
                return;
            }
        }

        Array.from(this.subpackages.entries()).forEach(([packageId, subpackage]) =>
            getSubpackageClasses(
                subpackage.name,
                packageId,
                subpackage,
                this.services,
                this.subpackages,
                this.clientName,
                this.gemName,
                this.crf,
                this.irBasePath,
                this.generatedClasses,
                this.flattenedProperties
            )
        );

        // 3. Generate main file, this is what people import while leveraging the gem.
        const rootSubpackageClasses = this.intermediateRepresentation.rootPackage.subpackages
            .map((sp) => subpackageClassReferences.get(sp))
            .filter((cp) => cp !== undefined) as ClientClassPair[];
        // TODO: see if there's a better way to "export" all types
        const allTypeImports = Array.from(this.crf.generatedReferences.values());
        const typeExporter = new RootImportsFile(allTypeImports);
        const typeExporterLocation = "types_export";
        clientFiles.push(new GeneratedRubyFile({ rootNode: typeExporter, fullPath: typeExporterLocation }));

        clientFiles.push(
            generateRootPackage(
                this.gemName,
                this.clientName,
                syncClientClass,
                asyncClientClass,
                requestOptionsClass,
                idempotencyRequestOptionsClass,
                this.crf,
                new Map(rootSubpackageClasses.map((sp) => [sp.subpackageName, sp.syncClientClass])),
                new Map(rootSubpackageClasses.map((sp) => [sp.subpackageName, sp.asyncClientClass])),
                this.irBasePath,
                this.generatedClasses,
                this.flattenedProperties,
                fileUtilityClass,
                typeExporterLocation,
                environmentClass?.classReference,
                this.services.get(this.intermediateRepresentation.rootPackage.service ?? "")
            )
        );

        // TODO: Consider making Class_ + ClassReference and Function_ + Function invocation
        // follow a data model thats: ObjectDefinition, ObjectReference, ObjectInvocation(.withExample)
        return clientFiles;
    }
}
