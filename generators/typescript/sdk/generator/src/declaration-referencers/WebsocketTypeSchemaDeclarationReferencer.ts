import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export declare namespace WebsocketTypeSchemaDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        channel: FernIr.WebSocketChannel;
    }

    export type Init = AbstractSdkClientClassDeclarationReferencer.Init;
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
        return `${this.caseConverter.pascalUnsafe(name.channel.name)}SocketResponse`;
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
