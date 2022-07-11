import { RAW_DEFAULT_ID_TYPE } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernAstVisitor } from "../AstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { visitObject } from "./utils/ObjectPropertiesVisitor";

export function visitIds(ids: RawSchemas.IdSchema[] | undefined, visitor: Partial<FernAstVisitor>): void {
    if (ids == null) {
        return;
    }

    for (const id of ids) {
        visitor.id?.(id);
        visitor.typeDeclaration?.({
            typeName: typeof id === "string" ? id : id.name,
            declaration: typeof id === "string" || id.type == null ? RAW_DEFAULT_ID_TYPE : id.type,
        });

        if (typeof id === "string") {
            visitor.typeName?.(id);
        } else {
            visitObject(id, {
                name: (name) => {
                    visitor.typeName?.(name);
                },
                docs: createDocsVisitor(visitor),
                type: (type) => {
                    if (type != null) {
                        visitor.typeReference?.(type);
                    }
                },
            });
        }
    }
}
