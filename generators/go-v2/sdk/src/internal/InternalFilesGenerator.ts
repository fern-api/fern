import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class InternalFilesGenerator {
    private context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate(): GoFile[] {
        // Skip error_codes.go generation when using per-endpoint error codes
        if (this.context.customConfig.errorCodes === "per-endpoint") {
            return [];
        }
        const errorFiles = this.generateErrorFiles();
        return [...errorFiles];
    }

    private generateErrorFiles(): GoFile[] {
        const errorCodesContent = go.codeblock((writer) => {
            // Then write the variable
            writer.write("var ErrorCodes ");
            writer.writeNode(this.context.getErrorCodesTypeReference());
            writer.write(" = ");
            writer.writeNode(
                go.TypeInstantiation.struct({
                    typeReference: this.context.getErrorCodesTypeReference(),
                    fields: Object.values(this.context.ir.errors ?? {}).map((errorDeclaration) => {
                        const errorTypeReference = go.typeReference({
                            name: this.context.getClassName(errorDeclaration.name.name),
                            importPath: this.context.getLocationForErrorId(errorDeclaration.name.errorId).importPath
                        });
                        return {
                            name: errorDeclaration.statusCode.toString(),
                            value: go.TypeInstantiation.reference(
                                go.func({
                                    parameters: [
                                        go.parameter({
                                            name: "apiError",
                                            type: go.Type.pointer(
                                                go.Type.reference(this.context.getCoreApiErrorTypeReference())
                                            )
                                        })
                                    ],
                                    return_: [go.Type.error()],
                                    body: go.codeblock((writer) => {
                                        writer.write("return ");
                                        writer.writeNode(
                                            go.TypeInstantiation.structPointer({
                                                typeReference: errorTypeReference,
                                                fields: [
                                                    {
                                                        name: "APIError",
                                                        value: go.TypeInstantiation.reference(go.codeblock("apiError"))
                                                    }
                                                ]
                                            })
                                        );
                                    }),
                                    multiline: false
                                })
                            )
                        };
                    })
                })
            );
            writer.writeNewLineIfLastLineNot();
        });
        return [
            new GoFile({
                node: errorCodesContent,
                directory: RelativeFilePath.of(""),
                filename: "error_codes.go",
                packageName: this.context.getRootPackageName(),
                rootImportPath: this.context.getRootImportPath(),
                importPath: this.context.getRootImportPath(),
                customConfig: this.context.customConfig
            })
        ];
    }
}
