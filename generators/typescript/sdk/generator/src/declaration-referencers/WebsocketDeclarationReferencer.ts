import { ExportedFilePath, Reference, getExportedDirectoriesForFernFilepath } from "@fern-typescript/commons";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Name, WebSocketName } from "@fern-fern/ir-sdk/api";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export const WEBSOCKET_DIRECTORY_NAME = "websockets";

export class WebsocketDeclarationReferencer extends AbstractDeclarationReferencer<WebSocketName> {
    public getExportedFilepath(websocketName: WebSocketName): ExportedFilePath {
        // series of hack to get the filepath to work

        // we need to create an object that implements FernFilepath.
        // allParts and packagePath are FernIr.Name, and file is a FernIr.Name | undefined
        // so we need to create a FernFilepath that has allParts and packagePath as FernIr.Name, and file as FernIr.Name | undefined
        // we can do this by creating a new object that has all the same properties as FernFilepath, but with allParts and packagePath as FernIr.Name, and file as FernIr.Name | undefine
        const hackyFernFilepath = {
            allParts: [websocketName] as Name[],
            packagePath: [websocketName] as Name[],
            file: websocketName,
        };

        return {
            directories: [
                ...this.containingDirectory,
                ...getExportedDirectoriesForFernFilepath({
                    fernFilepath: hackyFernFilepath,
                    subExports: {
                        [RelativeFilePath.of(WEBSOCKET_DIRECTORY_NAME)]: {
                            exportAll: true
                        }
                    }
                }),
                {
                    nameOnDisk: WEBSOCKET_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true }
                }
            ],
            file: {
                nameOnDisk: this.getFilename(websocketName),
                exportDeclaration: { exportAll: true }
            }
        };
    }

    public getFilename(websocketName: Name): string {
        return `${this.getExportedName(websocketName)}.ts`;
    }

    public getExportedName(websocketName: Name): string {
        return websocketName.pascalCase.safeName;
    }

    public getReferenceToWebsocket(args: DeclarationReferencer.getReferenceTo.Options<Name>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }
} 