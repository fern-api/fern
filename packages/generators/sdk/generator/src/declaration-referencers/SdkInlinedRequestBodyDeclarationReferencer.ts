import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { ExportedFilePath, Reference } from "@fern-typescript/commons";
import { AbstractSdkClientClassDeclarationReferencer } from "./AbstractSdkClientClassDeclarationReferencer";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace SdkInlinedRequestBodyDeclarationReferencer {
    export interface Name {
        service: FernFilepath;
        endpoint: HttpEndpoint;
    }
}

const REQUESTS_DIRECTORY_NAME = "requests";

export class SdkInlinedRequestBodyDeclarationReferencer extends AbstractSdkClientClassDeclarationReferencer<SdkInlinedRequestBodyDeclarationReferencer.Name> {
    public getExportedFilepath(name: SdkInlinedRequestBodyDeclarationReferencer.Name): ExportedFilePath {
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
}
