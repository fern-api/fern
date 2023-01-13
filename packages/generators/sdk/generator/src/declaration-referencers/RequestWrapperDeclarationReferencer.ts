import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { ts } from "ts-morph";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";
import { AbstractServiceDeclarationReferencer } from "./AbstractServiceDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { ServiceDeclarationReferencer } from "./ServiceDeclarationReferencer";

export declare namespace RequestWrapperDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        serviceDeclarationReferencer: ServiceDeclarationReferencer;
    }

    export interface Name {
        service: FernFilepath;
        endpoint: HttpEndpoint;
    }
}

const REQUESTS_DIRECTORY_NAME = "requests";

export class RequestWrapperDeclarationReferencer extends AbstractServiceDeclarationReferencer<RequestWrapperDeclarationReferencer.Name> {
    public getExportedFilepath(name: RequestWrapperDeclarationReferencer.Name): ExportedFilePath {
        return {
            directories: [
                ...this.getExportedDirectory(name.service, {
                    subExports: {
                        [RelativeFilePath.of(REQUESTS_DIRECTORY_NAME)]: { exportAll: true },
                    },
                }),
                {
                    nameOnDisk: REQUESTS_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true },
                },
            ],
            file: {
                nameOnDisk: this.getFilename(name),
                exportDeclaration: {
                    namedExports: [this.getExportedName(name)],
                },
            },
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
}
