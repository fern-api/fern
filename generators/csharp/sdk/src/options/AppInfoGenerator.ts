import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { APP_INFO_TYPE_NAME } from "../root-client/buildAppInfoUserAgent.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Emits the public `AppInfo` record used by the opt-in `allow-user-agent-app-info`
 * feature. Only generated when that flag is enabled, so default-off output is
 * unchanged. The sanitized product token built from these fields is appended to the
 * SDK's `User-Agent` header (RFC 9110 §10.1.5).
 */
export class AppInfoGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.AppInfo,
            type: ast.Class.ClassType.Record,
            sealed: true,
            access: ast.Access.Public,
            summary:
                "Application information appended to the `User-Agent` header as an RFC 9110 product token\n(`{Name}/{Version} ({Comment})`). Caller-supplied values are sanitized before being written."
        });

        class_.addField({
            origin: class_.explicit("Name"),
            access: ast.Access.Public,
            get: true,
            init: true,
            useRequired: true,
            type: this.Primitive.string,
            summary: "The product name. Required; when null, empty, or whitespace the `User-Agent` is left unchanged."
        });
        class_.addField({
            origin: class_.explicit("Version"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: this.Primitive.string.asOptional(),
            summary: "The optional product version. Omitted from the token when null or blank."
        });
        class_.addField({
            origin: class_.explicit("Comment"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: this.Primitive.string.asOptional(),
            summary: "An optional comment (e.g. a homepage URL). Omitted from the token when null or blank."
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.publicCore,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${APP_INFO_TYPE_NAME}.cs`));
    }
}
