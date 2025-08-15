import { ruby } from "@fern-api/ruby-ast"

export function wrapAstNodeInModules(node: ruby.AstNode, moduleNames: string[]): ruby.AstNode {
    let topLevelNode: ruby.AstNode = node;
    for (const moduleName of moduleNames.reverse()) {
        const module = ruby.module({ name: moduleName });
        module.addStatement(topLevelNode);
        topLevelNode = module;
    }
    return topLevelNode;
}