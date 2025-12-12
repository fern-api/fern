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
        // Skip generating the global error_codes.go file if there are conflicting status codes
        // (e.g., multiple namespaced APIs with the same HTTP status codes like 400, 403, 500).
        // In this case, per-endpoint error handling will still work correctly, and unhandled
        // status codes will fall back to core.APIError.
        if (this.context.hasConflictingErrorStatusCodes()) {
            return [];
        }

        const errorCodesContent = go.codeblock((writer) => {
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
