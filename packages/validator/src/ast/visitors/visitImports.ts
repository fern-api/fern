import { FernAstVisitor } from "../AstVisitor";

export function visitImports(imports: Record<string, string> | undefined, visitor: Partial<FernAstVisitor>): void {
    if (imports == null) {
        return;
    }
    for (const _import of Object.values(imports)) {
        visitor.import?.(_import);
    }
}
