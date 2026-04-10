import { fail } from "node:assert";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type ServiceId = FernIr.ServiceId;

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { WebSocketClientGenerator } from "../websocket/WebsocketClientGenerator.js";

export class RootClientInterfaceGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private serviceId: ServiceId | undefined;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.serviceId = this.context.ir.rootPackage.service;
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`I${this.names.classes.rootClient}.cs`));
    }

    public doGenerate(): CSharpFile {
        const interface_ = this.csharp.interface_({
            name: `I${this.names.classes.rootClient}`,
            namespace: this.namespaces.root,
            access: ast.Access.Public,
            partial: true
        });

        for (const subpackage of this.getSubpackages()) {
            if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                interface_.addField({
                    name: this.case.pascalSafe(subpackage.name),
                    enclosingType: interface_,
                    access: ast.Access.Public,
                    get: true,
                    type: this.context.getSubpackageInterfaceReference(subpackage)
                });
            }
        }

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service =
                this.context.getHttpService(rootServiceId) ?? fail(`Service with id ${rootServiceId} not found`);
            const grpcClientInfo = this.context.getGrpcClientInfoForServiceId(rootServiceId);
            for (const endpoint of service.endpoints) {
                this.context.endpointGenerator.generateInterfaceSignature(interface_, {
                    serviceId: rootServiceId,
                    endpoint,
                    grpcClientInfo
                });
            }
        }

        this.generateWebsocketInterfaceFactories(interface_);

        return new CSharpFile({
            clazz: interface_,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    /**
     * Adds WebSocket factory method signatures to the root client interface.
     *
     * When WebSockets are enabled, iterates over subpackages with WebSocket channels
     * and adds factory method declarations that mirror the concrete factory methods
     * on the root client class.
     */
    private generateWebsocketInterfaceFactories(interface_: ast.Interface) {
        if (this.settings.enableWebsockets) {
            for (const subpackage of this.getSubpackages()) {
                if (subpackage.websocket != null) {
                    const websocketChannel = this.context.getWebsocketChannel(subpackage.websocket);
                    if (websocketChannel != null) {
                        WebSocketClientGenerator.createWebSocketApiInterfaceFactories(
                            interface_,
                            subpackage,
                            this.context,
                            this.namespaces.root,
                            websocketChannel
                        );
                    }
                }
            }
        }
    }

    private getSubpackages() {
        return this.context.getSubpackages(this.context.ir.rootPackage.subpackages);
    }
}
