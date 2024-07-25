import { noop, visitObject } from "@fern-api/core-utils";
import { PackageMarkerFileSchema } from "../schemas";
import { PackageMarkerAstVisitor } from "./PackageMarkerAstVisitor";

export async function visitPackageMarkerYamlAst(
    contents: PackageMarkerFileSchema,
    visitor: Partial<PackageMarkerAstVisitor>
): Promise<void> {
    await visitObject(contents, {
        docs: noop,
        imports: noop,
        types: noop,
        service: noop,
        webhooks: noop,
        errors: noop,
        channel: noop,
        export: async (export_) => {
            await visitor.export?.(typeof export_ === "string" ? export_ : export_?.dependency, ["export"]);
        },
        navigation: async (navigation) => {
            await visitor.navigation?.(navigation, ["navigation"]);
        }
    });
}
