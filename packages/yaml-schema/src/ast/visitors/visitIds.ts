import { IdSchema } from "../../schemas";
import { FernAstVisitor } from "../FernAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { visitObject } from "./utils/ObjectPropertiesVisitor";

export function visitIds({
    ids,
    visitor,
    nodePath,
}: {
    ids: IdSchema[] | undefined;
    visitor: Partial<FernAstVisitor>;
    nodePath: NodePath;
}): void {
    if (ids == null) {
        return;
    }

    for (const id of ids) {
        const nodePathForId = [...nodePath, typeof id === "string" ? id : id.name];
        visitor.id?.(id, nodePathForId);
        if (typeof id !== "string" && id.type != null) {
            visitor.typeDeclaration?.(
                {
                    typeName: id.name,
                    declaration: id.type,
                },
                nodePathForId
            );
        }

        if (typeof id === "string") {
            visitor.typeName?.(id, nodePathForId);
        } else {
            visitObject(id, {
                name: (name) => {
                    visitor.typeName?.(name, [...nodePathForId, "name"]);
                },
                docs: createDocsVisitor(visitor, nodePathForId),
                type: (type) => {
                    if (type != null) {
                        visitor.typeReference?.(type, [...nodePathForId, "type"]);
                    }
                },
            });
        }
    }
}
