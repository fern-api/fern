import { RawSchemas } from "@fern-api/yaml-schema";
import { FernAstVisitor } from "../AstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { visitObject } from "./utils/ObjectPropertiesVisitor";

export function visitIds(ids: RawSchemas.IdSchema[] | undefined, visitor: FernAstVisitor): void {
    if (ids == null) {
        return;
    }

    for (const id of ids) {
        visitor.id(id);

        if (typeof id === "string") {
            visitor.typeName(id);
        } else {
            visitObject(id, {
                name: (name) => {
                    visitor.typeName(name);
                },
                docs: createDocsVisitor(visitor),
                type: (type) => {
                    if (type != null) {
                        visitor.typeReference(type);
                    }
                },
            });
        }
    }
}
