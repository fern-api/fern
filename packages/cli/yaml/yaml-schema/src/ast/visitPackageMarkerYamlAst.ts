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
        export: async (export_) => {
            await visitor.export?.(export_, ["export"]);
        },
        navigation: async (navigation) => {
            await visitor.navigation?.(navigation, ["navigation"]);
        }
    });
}
