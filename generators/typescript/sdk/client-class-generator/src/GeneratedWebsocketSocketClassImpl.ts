import { ImportsManager, NpmPackage } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import { ClassDeclarationStructure, StructureKind, ts } from "ts-morph";

import { IntermediateRepresentation, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

export class GeneratedWebsocketSocketClassImpl implements GeneratedSdkClientClass {
    private readonly importsManager: ImportsManager;
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly channelId: WebSocketChannelId;
    private readonly packageResolver: PackageResolver;
    private readonly serviceClassName: string;
    private readonly errorResolver: ErrorResolver;

    constructor({
        importsManager,
        intermediateRepresentation,
        channelId,
        packageResolver,
        serviceClassName,
        errorResolver
    }: {
        importsManager: ImportsManager;
        intermediateRepresentation: IntermediateRepresentation;
        channelId: WebSocketChannelId;
        packageResolver: PackageResolver;
        serviceClassName: string;
        errorResolver: ErrorResolver;
    }) {
        this.importsManager = importsManager;
        this.intermediateRepresentation = intermediateRepresentation;
        this.channelId = channelId;
        this.packageResolver = packageResolver;
        this.serviceClassName = serviceClassName;
        this.errorResolver = errorResolver;
    }

    public writeToFile(context: any): void {
        const serviceClass: ClassDeclarationStructure = {
            kind: StructureKind.Class,
            name: this.serviceClassName,
            isExported: true,
            properties: [],
            ctors: [],
            methods: []
        };

        context.sourceFile.addClass(serviceClass);
    }

    public getOptionsPropertiesForSnippet(): any[] {
        return [];
    }

    public instantiate(args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }): ts.Expression {
        throw new Error("Not implemented");
    }

    public accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression {
        throw new Error("Not implemented");
    }

    public instantiateAsRoot(args: { context: any; npmPackage?: NpmPackage | undefined }): ts.Expression {
        throw new Error("Not implemented");
    }

    public invokeEndpoint(): any {
        throw new Error("Not implemented");
    }

    public getEndpoint(): any {
        throw new Error("Not implemented");
    }

    public maybeLeverageInvocation(): any {
        throw new Error("Not implemented");
    }
}
