import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Properties to include in the generated WebSocketDefaults record.
 * Computed from the union of all WebSocket auth contexts.
 */
export interface WebSocketDefaultsProperties {
    /** PascalCase property names for matched constructor params (e.g., "TenantName") mapped to their C# type */
    matchedProperties: Array<{ name: string; type: ast.Type }>;
    /** Whether to include a GetToken Func<string>? property for OAuth token injection */
    hasOAuthToken: boolean;
    /** Whether to include an Environment string? property */
    hasEnvironment: boolean;
}

export declare namespace WebSocketDefaultsGenerator {
    interface Args {
        context: SdkGeneratorContext;
        properties: WebSocketDefaultsProperties;
    }
}

/**
 * Generates the `WebSocketDefaults` sealed record in the `Core/` directory.
 *
 * This record bundles all auth credentials and environment info needed by
 * WebSocket factory methods into a single field on the root client, replacing
 * multiple separate private fields.
 *
 * Example generated output:
 * ```csharp
 * internal sealed record WebSocketDefaults
 * {
 *     public string? TenantName { get; init; }
 *     public Func<string>? GetToken { get; init; }
 *     public string? Environment { get; init; }
 * }
 * ```
 */
export class WebSocketDefaultsGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private static readonly CLASS_NAME = "WebSocketDefaults";
    private readonly properties: WebSocketDefaultsProperties;
    private readonly classReference: ast.ClassReference;

    constructor({ context, properties }: WebSocketDefaultsGenerator.Args) {
        super(context);
        this.properties = properties;
        this.classReference = this.csharp.classReference({
            name: WebSocketDefaultsGenerator.CLASS_NAME,
            namespace: this.namespaces.root
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.getCoreDirectory(),
            RelativeFilePath.of(`${WebSocketDefaultsGenerator.CLASS_NAME}.cs`)
        );
    }

    public doGenerate(): CSharpFile {
        const cls = this.csharp.class_({
            reference: this.classReference,
            access: ast.Access.Internal,
            sealed: true,
            type: ast.Class.ClassType.Record
        });

        // Add matched constructor param properties (e.g., TenantName)
        for (const prop of this.properties.matchedProperties) {
            cls.addField({
                name: prop.name,
                access: ast.Access.Public,
                type: prop.type.asOptional(),
                get: true,
                init: true
            });
        }

        // Add GetToken property for OAuth token injection
        if (this.properties.hasOAuthToken) {
            cls.addField({
                name: "GetToken",
                access: ast.Access.Public,
                type: this.Types.Arbitrary("Func<string>?"),
                summary:
                    "A function that returns the raw access token (without Bearer prefix) for WebSocket authentication.",
                get: true,
                init: true
            });
        }

        // Add Environment property for WebSocket URL resolution
        if (this.properties.hasEnvironment) {
            cls.addField({
                name: "Environment",
                access: ast.Access.Public,
                type: this.Primitive.string.asOptional(),
                summary: "The WebSocket environment URL inherited from the parent client.",
                get: true,
                init: true
            });
        }

        return new CSharpFile({
            clazz: cls,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }
}
