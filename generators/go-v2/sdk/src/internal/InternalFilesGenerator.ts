import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileLocation, GoFile } from "@fern-api/go-base";
import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class InternalFilesGenerator {
    private context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate(): GoFile[] {
        // Skip generating error_codes.go when errorCodes is "per-endpoint"
        if (this.context.customConfig.errorCodes === "per-endpoint") {
            return [];
        }
        const errorFiles = this.generateErrorFiles();
        return [...errorFiles];
    }

    private generateErrorFiles(): GoFile[] {
        // Group errors by their namespace (package location)
        const errorsByNamespace = this.groupErrorsByNamespace();

        const files: GoFile[] = [];

        // Always generate a root error_codes.go file, even if there are no errors.
        // This is required because client code always references ErrorCodes from the root package.
        const rootImportPath = this.context.getRootImportPath();
        const rootErrors = errorsByNamespace.get(rootImportPath) ?? [];
        const rootLocation: FileLocation = {
            importPath: rootImportPath,
            directory: RelativeFilePath.of("")
        };
        files.push(this.generateErrorCodesFile(rootErrors, rootLocation));

        // Generate error_codes.go files for other namespaces that have errors
        for (const [importPath, errors] of errorsByNamespace.entries()) {
            if (importPath === rootImportPath) {
                // Already handled above
                continue;
            }
            const firstError = errors[0];
            if (firstError == null) {
                continue;
            }
            const location = this.context.getLocationForErrorId(firstError.name.errorId);
            const file = this.generateErrorCodesFile(errors, location);
            files.push(file);
        }
        return files;
    }

    private groupErrorsByNamespace(): Map<string, ErrorDeclaration[]> {
        const errorsByNamespace = new Map<string, ErrorDeclaration[]>();

        for (const errorDeclaration of Object.values(this.context.ir.errors ?? {})) {
            const location = this.context.getLocationForErrorId(errorDeclaration.name.errorId);
            const importPath = location.importPath;

            if (!errorsByNamespace.has(importPath)) {
                errorsByNamespace.set(importPath, []);
            }
            errorsByNamespace.get(importPath)?.push(errorDeclaration);
        }

        return errorsByNamespace;
    }

    private generateErrorCodesFile(errors: ErrorDeclaration[], location: FileLocation): GoFile {
        const isRootPackage = location.importPath === this.context.getRootImportPath();
        const packageName = isRootPackage
            ? this.context.getRootPackageName()
            : (location.importPath.split("/").pop() ?? this.context.getRootPackageName());

        const errorCodesContent = go.codeblock((writer) => {
            writer.write("var ErrorCodes ");
            writer.writeNode(this.context.getErrorCodesTypeReference());
            writer.write(" = ");
            writer.writeNode(
                go.TypeInstantiation.struct({
                    typeReference: this.context.getErrorCodesTypeReference(),
                    fields: errors.map((errorDeclaration) => {
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

        return new GoFile({
            node: errorCodesContent,
            directory: location.directory,
            filename: "error_codes.go",
            packageName,
            rootImportPath: this.context.getRootImportPath(),
            importPath: location.importPath,
            customConfig: this.context.customConfig
        });
    }
}
