import type { Node as EstreeNode } from "estree";
import type { JSXAttribute } from "estree-jsx";
import { walk } from "estree-walker";

export function walkEstreeJsxAttributes(estree: EstreeNode, handlers: Record<string, (attr: JSXAttribute) => void>) {
    walk(estree, {
        enter: (node) => {
            if (node.type === "JSXElement") {
                node.openingElement.attributes.forEach((attr) => {
                    if (
                        attr.type === "JSXAttribute" &&
                        attr.name.type === "JSXIdentifier" &&
                        handlers[attr.name.name]
                    ) {
                        handlers[attr.name.name]?.(attr);
                    }
                });
            }
        }
    });
}
