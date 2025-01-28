import { AbstractGeneratorContext } from "@fern-api/base-generator";
import {
    ClassReferenceFactory,
    Class_,
    ExampleGenerator,
    GeneratedFile,
    GeneratedRubyFile,
    LocationGenerator,
    LongClassReference,
    Module_,
    Property
} from "@fern-api/ruby-codegen";

import {
    HttpService,
    IntermediateRepresentation,
    Name,
    OAuthScheme,
    ObjectProperty,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeId
} from "@fern-fern/ir-sdk/api";

import {
    ClientClassPair,
    generateDummyRootClient,
    generateEnvironmentConstants,
    generateRequestClients,
    generateRootPackage,
    generateRubyPathTemplate,
    generateService,
    generateSubpackage,
    getDefaultEnvironmentUrl,
    getOauthAccessTokenFunctionMetadata,
    getOauthRefreshTokenFunctionMetadata,
    getSubpackagePropertyNameFromIr
} from "./AbstractionUtilities";
import { ArtifactRegistry } from "./utils/ArtifactRegistry";
import { FileUploadUtility } from "./utils/FileUploadUtility";
import { HeadersGenerator } from "./utils/HeadersGenerator";
import { IdempotencyRequestOptions } from "./utils/IdempotencyRequestOptionsClass";
import { RequestOptions } from "./utils/RequestOptionsClass";
import { RootImportsFile } from "./utils/RootImportsFile";
import { AccessToken } from "./utils/oauth/AccessToken";
import { OauthTokenProvider } from "./utils/oauth/OauthTokenProvider";

// TODO: This (as an abstract class) will probably be used across CLIs
export class ClientsGenerator {
    private services: Map<ServiceId, HttpService>;
    private subpackages: Map<SubpackageId, Subpackage>;
    private gc: AbstractGeneratorContext;
    private irBasePath: string;
    private generatedClasses: Map<TypeId, Class_>;
    private flattenedProperties: Map<TypeId, ObjectProperty[]>;
    private subpackagePaths: Map<SubpackageId, string[]>;

    private apiName: string;
    private clientName: string;
    private gemName: string;
    private sdkVersion: string | undefined;
    private hasFileBasedDependencies: boolean;
    private intermediateRepresentation: IntermediateRepresentation;
    private crf: ClassReferenceFactory;
    private locationGenerator: LocationGenerator;

    private shouldGenerateOauth: boolean;
    private oauthScheme: OAuthScheme | undefined;
    private artifactRegistry: ArtifactRegistry;

    // TODO: should this be an object instead of a string
    private defaultEnvironment: string | undefined;

    constructor({
        gemName,
        clientName,
        generatorContext,
        intermediateRepresentation,
        sdkVersion,
        generatedClasses,
        flattenedProperties,
        hasFileBasedDependencies,
        locationGenerator,
        classReferenceFactory,
        shouldFlattenModules
    }: {
        gemName: string;
        clientName: string;
        generatorContext: AbstractGeneratorContext;
        intermediateRepresentation: IntermediateRepresentation;
        sdkVersion: string | undefined;
        generatedClasses: Map<TypeId, Class_>;
        flattenedProperties: Map<TypeId, ObjectProperty[]>;
        hasFileBasedDependencies: boolean;
        locationGenerator: LocationGenerator | undefined;
        classReferenceFactory: ClassReferenceFactory | undefined;
        shouldFlattenModules: boolean;
    }) {
        this.gc = generatorContext;
        this.sdkVersion = sdkVersion;
        this.intermediateRepresentation = intermediateRepresentation;
        this.clientName = clientName;
        this.gemName = gemName;
        this.apiName = intermediateRepresentation.apiName.snakeCase.safeName;
        this.hasFileBasedDependencies = hasFileBasedDependencies;

        // These should be gotten from the TypesGenerator
        this.locationGenerator =
            locationGenerator == null
                ? new LocationGenerator(this.gemName, this.clientName, shouldFlattenModules)
                : locationGenerator;
        if (classReferenceFactory !== undefined) {
            this.crf = classReferenceFactory;
        } else {
            this.gc.logger.warn("Client generator was not provided a ClassReferenceFactory, regenerating one.");
            const types = new Map();
            for (const type of Object.values(intermediateRepresentation.types)) {
                types.set(type.name.typeId, type);
            }
            this.crf = new ClassReferenceFactory(types, this.locationGenerator);
        }

        this.generatedClasses = generatedClasses;
        this.flattenedProperties = flattenedProperties;

        this.services = new Map(Object.entries(intermediateRepresentation.services));
        this.subpackages = new Map(Object.entries(intermediateRepresentation.subpackages));
        // Maps the subpackage by ID to it's subpackage path (e.g. the package route)
        this.subpackagePaths = new Map<string, string[]>();
        this.subpackages.forEach((subpackage, subpackageId) => {
            const path = subpackage.fernFilepath.allParts.map((part) => getSubpackagePropertyNameFromIr(part));
            this.subpackagePaths.set(subpackageId, path);
        });

        this.irBasePath = generateRubyPathTemplate(
            this.intermediateRepresentation.pathParameters,
            this.intermediateRepresentation.basePath
        );

        this.oauthScheme = this.gc.config.generateOauthClients
            ? this.intermediateRepresentation.auth.schemes
                  .find((scheme) => scheme.type === "oauth")
                  ?._visit<OAuthScheme | undefined>({
                      basic: () => undefined,
                      bearer: () => undefined,
                      header: () => undefined,
                      oauth: (oauth) => oauth,
                      _other: () => undefined
                  })
            : undefined;
        this.shouldGenerateOauth = this.oauthScheme != null && this.gc.config.generateOauthClients;
        this.artifactRegistry = new ArtifactRegistry();
    }

    public generateFiles(): GeneratedFile[] {
        const clientFiles: GeneratedFile[] = [];

        let environmentClass: Class_ | undefined;
        if (this.intermediateRepresentation.environments !== undefined) {
            this.gc.logger.debug("Preparing environment files.");
            this.defaultEnvironment = getDefaultEnvironmentUrl(
                this.clientName,
                this.intermediateRepresentation.environments
            );

            environmentClass = generateEnvironmentConstants(
                this.intermediateRepresentation.environments,
                this.clientName
            );
            const environmentsModule = Module_.wrapInModules({
                locationGenerator: this.locationGenerator,
                child: environmentClass
            });
            clientFiles.push(
                new GeneratedRubyFile({
                    rootNode: environmentsModule,
                    fullPath: "environment"
                })
            );
        }

        this.gc.logger.debug("Preparing authorization headers.");
        const headersGenerator = new HeadersGenerator(
            this.intermediateRepresentation.headers,
            this.crf,
            this.intermediateRepresentation.auth,
            this.shouldGenerateOauth
        );

        this.gc.logger.debug("Preparing request options classes.");
        const requestOptionsClass = new RequestOptions({
            headersGenerator,
            clientName: this.clientName
        });
        const idempotencyRequestOptionsClass = new IdempotencyRequestOptions({
            crf: this.crf,
            idempotencyHeaders: this.intermediateRepresentation.idempotencyHeaders,
            headersGenerator,
            clientName: this.clientName
        });

        const retriesProperty = new Property({
            name: "max_retries",
            type: LongClassReference,
            isOptional: true,
            documentation: "The number of times to retry a failed request, defaults to 2."
        });
        const timeoutProperty = new Property({
            name: "timeout_in_seconds",
            type: LongClassReference,
            isOptional: true
        });

        this.gc.logger.debug("Preparing request clients.");
        const [syncClientClass, asyncClientClass] = generateRequestClients(
            this.clientName,
            this.intermediateRepresentation.sdkConfig,
            this.gemName,
            this.sdkVersion,
            headersGenerator,
            environmentClass?.classReference,
            this.intermediateRepresentation.environments?.environments.type === "multipleBaseUrls",
            this.defaultEnvironment,
            this.hasFileBasedDependencies,
            requestOptionsClass,
            retriesProperty,
            timeoutProperty
        );
        const requestsModule = Module_.wrapInModules({
            locationGenerator: this.locationGenerator,
            child: [syncClientClass, asyncClientClass, requestOptionsClass, idempotencyRequestOptionsClass]
        });

        clientFiles.push(
            new GeneratedRubyFile({
                rootNode: requestsModule,
                fullPath: "requests"
            })
        );

        this.gc.logger.debug("Preparing example snippets.");
        const dummyRootClientDoNotUse = generateDummyRootClient(this.gemName, this.clientName, syncClientClass);
        const eg = new ExampleGenerator({
            rootClientClass: dummyRootClientDoNotUse,
            crf: this.crf,
            gemName: this.gemName,
            apiName: this.apiName
        });

        const fileUtilityClass = new FileUploadUtility(this.clientName);
        if (this.hasFileBasedDependencies) {
            const fileUtilityModule = Module_.wrapInModules({
                locationGenerator: this.locationGenerator,
                child: fileUtilityClass
            });
            clientFiles.push(
                new GeneratedRubyFile({
                    rootNode: fileUtilityModule,
                    fullPath: "core/file_utilities"
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
            flattenedProperties: Map<TypeId, ObjectProperty[]>,
            subpackagePaths: Map<SubpackageId, string[]>,
            artifactRegistry: ArtifactRegistry,
            subpackages: Map<Name, Class_> = new Map(),
            asyncSubpackages: Map<Name, Class_> = new Map()
        ): ClientClassPair {
            if (subpackage.service === undefined) {
                throw new Error("Calling getServiceClasses without a service defined within the subpackage.");
            }
            const service = services.get(subpackage.service);
            if (service === undefined) {
                throw new Error(`Service ${subpackage.service} was not defined within in the IR`);
            }

            const serviceClasses = generateService(
                clientName,
                service,
                subpackage,
                syncClientClass.classReference,
                asyncClientClass.classReference,
                crf,
                eg,
                requestOptionsClass,
                idempotencyRequestOptionsClass,
                irBasePath,
                generatedClasses,
                flattenedProperties,
                fileUtilityClass,
                locationGenerator,
                subpackagePaths.get(packageId) ?? [],
                artifactRegistry,
                subpackages,
                asyncSubpackages
            );
            const serviceModule = Module_.wrapInModules({
                locationGenerator,
                child: [serviceClasses.syncClientClass, serviceClasses.asyncClientClass],
                path: subpackage.fernFilepath,
                includeFilename: false
            });
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
            crf: ClassReferenceFactory,
            irBasePath: string,
            generatedClasses: Map<TypeId, Class_>,
            flattenedProperties: Map<TypeId, ObjectProperty[]>,
            subpackagePaths: Map<SubpackageId, string[]>,
            artifactRegistry: ArtifactRegistry
        ): ClientClassPair | undefined {
            if (subpackage.service != null) {
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
                                crf,
                                irBasePath,
                                generatedClasses,
                                flattenedProperties,
                                subpackagePaths,
                                artifactRegistry
                            );
                        }
                        return classPair;
                    })
                    .filter((cp) => cp !== undefined) as ClientClassPair[];

                return getServiceClasses(
                    packageId,
                    subpackage,
                    services,
                    clientName,
                    crf,
                    irBasePath,
                    generatedClasses,
                    flattenedProperties,
                    subpackagePaths,
                    artifactRegistry,
                    new Map(classPairs.map((cp) => [cp.subpackageName, cp.syncClientClass])),
                    new Map(classPairs.map((cp) => [cp.subpackageName, cp.asyncClientClass]))
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
                                    crf,
                                    irBasePath,
                                    generatedClasses,
                                    flattenedProperties,
                                    subpackagePaths,
                                    artifactRegistry
                                );
                            }
                            return classPair;
                        })
                        .filter((cp) => cp !== undefined) as ClientClassPair[];

                    const subpackageClasses = generateSubpackage(
                        clientName,
                        subpackageName,
                        subpackage,
                        syncClientClass.classReference,
                        asyncClientClass.classReference,
                        locationGenerator,
                        new Map(classPairs.map((cp) => [cp.subpackageName, cp.syncClientClass])),
                        new Map(classPairs.map((cp) => [cp.subpackageName, cp.asyncClientClass]))
                    );

                    const subpackageModule = Module_.wrapInModules({
                        locationGenerator,
                        child: [subpackageClasses.syncClientClass, subpackageClasses.asyncClientClass],
                        path: subpackage.fernFilepath
                    });
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

        this.gc.logger.debug("Generating files for subpackages.");
        Array.from(this.subpackages.entries()).forEach(([packageId, subpackage]) =>
            getSubpackageClasses(
                subpackage.name,
                packageId,
                subpackage,
                this.services,
                this.subpackages,
                this.clientName,
                this.crf,
                this.irBasePath,
                this.generatedClasses,
                this.flattenedProperties,
                this.subpackagePaths,
                this.artifactRegistry
            )
        );

        // 3. Generate main file, this is what people import while leveraging the gem.
        this.gc.logger.debug("Generating files for root package.");
        const rootSubpackageClasses = this.intermediateRepresentation.rootPackage.subpackages
            .map((sp) => subpackageClassReferences.get(sp))
            .filter((cp) => cp !== undefined) as ClientClassPair[];
        // TODO: see if there's a better way to "export" all types
        const allTypeImports = Array.from(this.crf.generatedReferences.values());
        const typeExporter = new RootImportsFile(allTypeImports);
        const typeExporterLocation = "types_export";
        clientFiles.push(new GeneratedRubyFile({ rootNode: typeExporter, fullPath: typeExporterLocation }));

        let oauthTokenProvider: OauthTokenProvider | undefined;
        if (this.shouldGenerateOauth && this.oauthScheme != null) {
            const accessTokenClass = new AccessToken(this.clientName, this.oauthScheme.configuration);

            let maybeRefereshTokenDetails;
            if (this.oauthScheme.configuration.refreshEndpoint) {
                maybeRefereshTokenDetails = getOauthRefreshTokenFunctionMetadata({
                    refreshEndpoint: this.oauthScheme.configuration.refreshEndpoint,
                    artifactRegistry: this.artifactRegistry
                });
            }
            const oauthConfiguration = {
                accessTokenFunction: getOauthAccessTokenFunctionMetadata({
                    tokenEndpoint: this.oauthScheme.configuration.tokenEndpoint,
                    artifactRegistry: this.artifactRegistry
                }),
                refreshTokenFunction: maybeRefereshTokenDetails
            };

            oauthTokenProvider = new OauthTokenProvider({
                clientName: this.clientName,
                oauthConfiguration,
                oauthType: "client_credentials",
                requestClientReference: syncClientClass.classReference,
                accessTokenReference: accessTokenClass.classReference
            });
            const oauthModule = Module_.wrapInModules({
                locationGenerator,
                child: [accessTokenClass, oauthTokenProvider]
            });
            clientFiles.push(
                new GeneratedRubyFile({
                    rootNode: oauthModule,
                    fullPath: "core/oauth"
                })
            );
        }

        clientFiles.push(
            generateRootPackage(
                this.gemName,
                this.clientName,
                syncClientClass,
                asyncClientClass,
                requestOptionsClass,
                idempotencyRequestOptionsClass,
                this.crf,
                eg,
                new Map(rootSubpackageClasses.map((sp) => [sp.subpackageName, sp.syncClientClass])),
                new Map(rootSubpackageClasses.map((sp) => [sp.subpackageName, sp.asyncClientClass])),
                this.irBasePath,
                this.generatedClasses,
                this.flattenedProperties,
                fileUtilityClass,
                typeExporterLocation,
                headersGenerator,
                retriesProperty,
                timeoutProperty,
                this.artifactRegistry,
                oauthTokenProvider,
                locationGenerator,
                environmentClass?.classReference,
                this.defaultEnvironment,
                this.services.get(this.intermediateRepresentation.rootPackage.service ?? "")
            )
        );

        this.gc.logger.debug("Generating snippets.json file.");
        if (this.gc.config.output.snippetFilepath !== undefined) {
            clientFiles.push(eg.generateSnippetsFile(this.gc.config.output.snippetFilepath));
        }

        // TODO: Consider making Class_ + ClassReference and Function_ + Function invocation
        // follow a data model thats: ObjectDefinition, ObjectReference, ObjectInvocation(.withExample)
        return clientFiles;
    }
}
