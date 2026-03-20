import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Generates the WebSocketDefaults.cs file in the Core directory.
 *
 * This record carries the authentication credentials that WebSocket APIs
 * need from the parent client: TenantName, a lazy token accessor, and
 * the WebSocket environment URL.
 */
export class WebSocketDefaultsGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private classReference: ast.ClassReference;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.classReference = this.csharp.classReference({
            name: "WebSocketDefaults",
            namespace: this.namespaces.core
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.context.getCoreDirectory(), RelativeFilePath.of("WebSocketDefaults.cs"));
    }

    public doGenerate(): CSharpFile {
        const cls = this.csharp.class_({
            reference: this.classReference,
            access: ast.Access.Internal,
            sealed: true,
            type: ast.Class.ClassType.Record
        });

        cls.addField({
            name: "TenantName",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true
        });

        cls.addField({
            name: "GetToken",
            access: ast.Access.Public,
            type: this.Types.Arbitrary("Func<string>"),
            get: true,
            init: true,
            useRequired: true
        });

        cls.addField({
            name: "Environment",
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: true,
            init: true,
            useRequired: true
        });

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
