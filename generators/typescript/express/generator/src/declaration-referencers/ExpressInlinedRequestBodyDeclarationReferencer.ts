import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import {
    AbstractExpressServiceDeclarationReferencer,
    AbstractSdkClientClassDeclarationReferencer
} from "./AbstractExpressServiceDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";

export declare namespace ExpressInlinedRequestBodyDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
    }
    export type Init = AbstractSdkClientClassDeclarationReferencer.Init;
}

const REQUESTS_DIRECTORY_NAME = "requests";

export class ExpressInlinedRequestBodyDeclarationReferencer extends AbstractExpressServiceDeclarationReferencer<ExpressInlinedRequestBodyDeclarationReferencer.Name> {
    public getExportedFilepath(name: ExpressInlinedRequestBodyDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: [
                ...this.getExportedDirectory(name, {
                    subExports: {
                        [RelativeFilePath.of(REQUESTS_DIRECTORY_NAME)]: { exportAll: true }
                    }
                }),
                {
                    nameOnDisk: REQUESTS_DIRECTORY_NAME,
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

    public getFilename(name: ExpressInlinedRequestBodyDeclarationReferencer.Name): string {
        return `${this.getExportedName(name)}.ts`;
    }

    public getExportedName(name: ExpressInlinedRequestBodyDeclarationReferencer.Name): string {
        if (name.endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Cannot get exported name for inlined request, because endpoint request is not inlined");
        }
        return this.case.pascalUnsafe(name.endpoint.requestBody.name);
    }

    public getReferenceToInlinedRequestBody(
        args: DeclarationReferencer.getReferenceTo.Options<ExpressInlinedRequestBodyDeclarationReferencer.Name>
    ): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    protected getPackageIdFromName(name: ExpressInlinedRequestBodyDeclarationReferencer.Name): PackageId {
        return name.packageId;
    }
}
