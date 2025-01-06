import { ExportedFilePath, PackageId } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace RequestWrapperDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        endpoint: HttpEndpoint;
    }
}

const REQUESTS_DIRECTORY_NAME = "requests";

export class RequestWrapperDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<RequestWrapperDeclarationReferencer.Name> {
    public getExportedFilepath(name: RequestWrapperDeclarationReferencer.Name): ExportedFilePath {
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

    public getFilename(name: RequestWrapperDeclarationReferencer.Name): string {
        return `${this.getExportedName(name)}.ts`;
    }

    public getExportedName(name: RequestWrapperDeclarationReferencer.Name): string {
        if (name.endpoint.sdkRequest == null || name.endpoint.sdkRequest.shape.type !== "wrapper") {
            throw new Error("Cannot get exported name for request wrapper, because endpoint request is not wrapped");
        }
        return name.endpoint.sdkRequest.shape.wrapperName.pascalCase.unsafeName;
    }

    public getReferenceToRequestWrapperType(
        args: DeclarationReferencer.getReferenceTo.Options<RequestWrapperDeclarationReferencer.Name>
    ): ts.TypeNode {
        return this.getReferenceTo(this.getExportedName(args.name), args).getTypeNode();
    }

    protected getPackageIdFromName(name: RequestWrapperDeclarationReferencer.Name): PackageId {
        return name.packageId;
    }
}
