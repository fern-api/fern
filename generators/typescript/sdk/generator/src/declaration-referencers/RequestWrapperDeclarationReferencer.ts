import { RelativeFilePath } from "@fern-api/fs-utils";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath, PackageId } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace RequestWrapperDeclarationReferencer {
    export interface Name {
        packageId: PackageId;
        endpoint: HttpEndpoint;
    }

    export interface Init extends AbstractSdkClientClassDeclarationReferencer.Init {
        exportAllRequestsAtRoot: boolean;
        inlinePathParameters: boolean | "always";
    }
}

const REQUESTS_DIRECTORY_NAME = "requests";

export class RequestWrapperDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<RequestWrapperDeclarationReferencer.Name> {
    private exportAllRequestsAtRoot: boolean;
    private inlinePathParameters: boolean | "always";

    constructor({
        exportAllRequestsAtRoot,
        inlinePathParameters,
        ...superInit
    }: RequestWrapperDeclarationReferencer.Init) {
        super(superInit);
        this.exportAllRequestsAtRoot = exportAllRequestsAtRoot;
        this.inlinePathParameters = inlinePathParameters;
    }

    public getExportedFilepath(name: RequestWrapperDeclarationReferencer.Name): ExportedFilePath {
        if (this.exportAllRequestsAtRoot) {
            return this.getAggregatedRequestsFilepath();
        }

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
        if (name.endpoint.sdkRequest == null) {
            if (this.inlinePathParameters === "always") {
                return `${name.endpoint.name.pascalCase.unsafeName}Request`;
            }
            throw new Error("Cannot get exported name for request wrapper, because endpoint request is not wrapped");
        }
        if (name.endpoint.sdkRequest.shape.type !== "wrapper") {
            throw new Error("Cannot get exported name for request wrapper, because endpoint request is not wrapped");
        }
        return name.endpoint.sdkRequest.shape.wrapperName.pascalCase.unsafeName;
    }

    public getAggregatedRequestsFilepath(): ExportedFilePath {
        if (!this.exportAllRequestsAtRoot) {
            throw new Error(
                "getAggregatedRequestsFilepath() should only be called when exportAllRequestsAtRoot is true"
            );
        }

        return {
            directories: [
                ...this.containingDirectory,
                {
                    nameOnDisk: REQUESTS_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true }
                }
            ],
            file: {
                nameOnDisk: `${REQUESTS_DIRECTORY_NAME}.ts`,
                exportDeclaration: { exportAll: true }
            }
        };
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
