import { ExportedFilePath, PackageId, Reference } from "@fern-typescript/commons";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace SdkInlinedRequestBodyDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        endpoint: HttpEndpoint;
    }
}

const REQUESTS_DIRECTORY_NAME = "requests";

export class SdkInlinedRequestBodyDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<SdkInlinedRequestBodyDeclarationReferencer.Name> {
    public getExportedFilepath(name: SdkInlinedRequestBodyDeclarationReferencer.Name): ExportedFilePath {
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

    public getFilename(name: SdkInlinedRequestBodyDeclarationReferencer.Name): string {
        return `${this.getExportedName(name)}.ts`;
    }

    public getExportedName(name: SdkInlinedRequestBodyDeclarationReferencer.Name): string {
        if (name.endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Cannot get exported name for inlined request, because endpoint request is not inlined");
        }
        return name.endpoint.requestBody.name.pascalCase.unsafeName;
    }

    public getReferenceToInlinedRequestBody(
        args: DeclarationReferencer.getReferenceTo.Options<SdkInlinedRequestBodyDeclarationReferencer.Name>
    ): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    protected getPackageIdFromName(name: SdkInlinedRequestBodyDeclarationReferencer.Name): PackageId {
        return name.packageId;
    }
}
