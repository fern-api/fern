import { RelativeFilePath } from "@fern-api/fs-utils";
import { WebSocketChannel } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace WebsocketTypeSchemaDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        channel: WebSocketChannel;
    }
}

const SOCKET_DIRECTORY_NAME = "socket";

export class WebsocketTypeSchemaDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<WebsocketTypeSchemaDeclarationReferencer.Name> {
    public getExportedFilepath(name: WebsocketTypeSchemaDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: [
                ...this.getExportedDirectory(name, {
                    subExports: {
                        [RelativeFilePath.of(SOCKET_DIRECTORY_NAME)]: { exportAll: true }
                    }
                }),
                {
                    nameOnDisk: SOCKET_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true }
                }
            ],
            file: {
                nameOnDisk: this.getFilename(name),
                exportDeclaration: {
                    namedExports: [this.getExportedName(name)]
                }
            }
        };
    }

    public getFilename(name: WebsocketTypeSchemaDeclarationReferencer.Name): string {
        return `${this.getExportedName(name)}.ts`;
    }

    public getExportedName(name: WebsocketTypeSchemaDeclarationReferencer.Name): string {
        return `${name.channel.name.pascalCase.unsafeName}SocketResponse`;
    }

    public getReferenceToWebsocketResponseType(
        args: DeclarationReferencer.getReferenceTo.Options<WebsocketTypeSchemaDeclarationReferencer.Name>
    ): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    protected getPackageIdFromName(name: WebsocketTypeSchemaDeclarationReferencer.Name): PackageId {
        return name.packageId;
    }
}
