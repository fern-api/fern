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

        // Get all namespaces that have services (endpoints)
        const namespacesWithServices = this.getNamespacesWithServices();

        const files: GoFile[] = [];
        const rootImportPath = this.context.getRootImportPath();

        // Generate error_codes.go for each namespace that has services
        // Each namespace needs its own ErrorCodes variable that clients can reference
        for (const location of namespacesWithServices) {
            const errors = errorsByNamespace.get(location.importPath) ?? [];
            files.push(this.generateErrorCodesFile(errors, location));
        }

        // If root namespace has errors but no services, still generate root error_codes.go
        const rootHasServices = namespacesWithServices.some((loc) => loc.importPath === rootImportPath);
        if (!rootHasServices && errorsByNamespace.has(rootImportPath)) {
            const rootErrors = errorsByNamespace.get(rootImportPath) ?? [];
            const rootLocation: FileLocation = {
                importPath: rootImportPath,
                directory: RelativeFilePath.of("")
            };
            files.push(this.generateErrorCodesFile(rootErrors, rootLocation));
        }

        return files;
    }

    private getNamespacesWithServices(): FileLocation[] {
        const namespaces = new Map<string, FileLocation>();
        const rootImportPath = this.context.getRootImportPath();

        for (const service of Object.values(this.context.ir.services)) {
            const location = this.context.getPackageLocation(service.name.fernFilepath);
            if (!namespaces.has(location.importPath)) {
                namespaces.set(location.importPath, location);
            }
        }

        // If there are services at the root level (no subpackages), add root namespace
        // This is determined by checking if any service has an empty packagePath
        for (const service of Object.values(this.context.ir.services)) {
            if (service.name.fernFilepath.packagePath.length === 0) {
                if (!namespaces.has(rootImportPath)) {
                    namespaces.set(rootImportPath, {
                        importPath: rootImportPath,
                        directory: RelativeFilePath.of("")
                    });
                }
                break;
            }
        }

        return Array.from(namespaces.values());
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
