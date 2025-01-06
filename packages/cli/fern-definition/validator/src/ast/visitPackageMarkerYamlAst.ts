import { noop, visitObject } from "@fern-api/core-utils";
import { PackageMarkerFileSchema } from "@fern-api/fern-definition-schema";

import { PackageMarkerAstVisitor } from "./PackageMarkerAstVisitor";

export function visitPackageMarkerYamlAst(
    contents: PackageMarkerFileSchema,
    visitor: Partial<PackageMarkerAstVisitor>
): void {
    visitObject(contents, {
        docs: noop,
        imports: noop,
        types: noop,
        service: noop,
        webhooks: noop,
        errors: noop,
        channel: noop,
        export: (export_) => {
            visitor.export?.(typeof export_ === "string" ? export_ : export_?.dependency, ["export"]);
        },
        navigation: (navigation) => {
            visitor.navigation?.(navigation, ["navigation"]);
        }
    });
}
