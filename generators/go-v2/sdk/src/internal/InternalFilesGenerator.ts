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
        const errorFiles = this.generateErrorFiles();
        return [...errorFiles];
    }

    private generateErrorFiles(): GoFile[] {
        const errorCodesContent = go.codeblock((writer) => {
            writer.write("var errorCodes ErrorCodes = ");
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
                directory: RelativeFilePath.of("internal"),
                filename: "error_codes.go",
                packageName: "internal",
                rootImportPath: this.context.getRootImportPath(),
                importPath: this.context.getInternalImportPath(),
                customConfig: this.context.customConfig
            })
        ];
    }
}
