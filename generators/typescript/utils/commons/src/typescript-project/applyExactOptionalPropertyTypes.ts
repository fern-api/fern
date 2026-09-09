import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import {
    Node,
    ObjectLiteralExpression,
    Project,
    SourceFile,
    SpreadAssignment,
    SyntaxKind,
    ts,
    Type,
    TypeNode,
    TypeReferenceNode
} from "ts-morph";

// Properties with these type keywords already admit `undefined` assignments, so
// appending `| undefined` would be redundant.
const TYPE_KINDS_THAT_ACCEPT_UNDEFINED = new Set<SyntaxKind>([
    SyntaxKind.UndefinedKeyword,
    SyntaxKind.AnyKeyword,
    SyntaxKind.UnknownKeyword,
    SyntaxKind.VoidKeyword
]);

// `T | undefined` parses incorrectly without parentheses for these type kinds
// (e.g. `() => void | undefined` would bind `| undefined` to the return type).
const TYPE_KINDS_THAT_NEED_PARENS_IN_UNION = new Set<SyntaxKind>([
    SyntaxKind.FunctionType,
    SyntaxKind.ConstructorType,
    SyntaxKind.ConditionalType,
    SyntaxKind.InferType
]);

/**
 * Rewrites a persisted TypeScript project so that it compiles cleanly under
 * `exactOptionalPropertyTypes`.
 *
 * Under `exactOptionalPropertyTypes`, an optional property `foo?: T` does not
 * admit an explicit `undefined` value — callers must omit the property instead.
 * To remain assignable from `T | undefined` values, every emitted optional
 * property is rewritten to `foo?: T | undefined`.
 *
 * Two follow-on hazards are fixed as well:
 *
 * 1. `Required<T>` strips the `?` modifier but keeps an explicit `| undefined`
 *    in the property type, so `Required<{ foo?: string | undefined }>` produces
 *    `foo: string | undefined` rather than `foo: string`. `Required<Local>` is
 *    rewritten to `{ [K in keyof Local]-?: Exclude<Local[K], undefined> }`,
 *    which preserves the exact pre-rewrite semantics.
 * 2. Spreading an object whose properties may be `undefined` back over a
 *    defaults object (`{ ...defaults, ...options }`) produces `| undefined`
 *    properties in the resulting type. Such literals are rewritten to
 *    `Object.assign({}, ...)` segments, whose intersection-typed result
 *    collapses `T & (T | undefined)` back to `T`.
 *
 * Finally, `exactOptionalPropertyTypes: true` is written into the generated
 * `tsconfig*.json` files so the package compiles itself under the stricter mode.
 *
 * @param pathToProject - The absolute path to the root of the TypeScript project.
 */
export async function applyExactOptionalPropertyTypes(pathToProject: AbsoluteFilePath): Promise<void> {
    const filePaths = await glob("**/*.{ts,mts,cts}", {
        cwd: pathToProject,
        nodir: true,
        absolute: true,
        ignore: ["**/node_modules/**", "**/dist/**"]
    });
    const project = new Project({
        // `strictNullChecks` is required so that optional parameters and
        // properties resolve to `T | undefined` in type queries below.
        compilerOptions: { strictNullChecks: true, moduleResolution: ts.ModuleResolutionKind.Node10 }
    });
    project.addSourceFilesAtPaths(filePaths);

    const localTypeNames = collectLocalTypeNames(project);

    for (const sourceFile of project.getSourceFiles()) {
        // Each edit may invalidate previously-fetched nodes in the file, so each
        // rule locates the first remaining match, applies a single edit, and
        // re-scans until no match is left.
        let edited = true;
        while (edited) {
            edited =
                appendUndefinedToFirstOptionalProperty(sourceFile) ||
                rewriteFirstRequiredTypeReference(sourceFile, localTypeNames) ||
                rewriteFirstOptionalSpread(sourceFile);
        }
    }
    await project.save();

    await enableExactOptionalPropertyTypesInTsConfigs(pathToProject);
}

function collectLocalTypeNames(project: Project): Set<string> {
    const names = new Set<string>();
    for (const sourceFile of project.getSourceFiles()) {
        for (const interfaceDeclaration of sourceFile.getInterfaces()) {
            names.add(interfaceDeclaration.getName());
        }
        for (const typeAlias of sourceFile.getTypeAliases()) {
            names.add(typeAlias.getName());
        }
    }
    return names;
}

function appendUndefinedToFirstOptionalProperty(sourceFile: SourceFile): boolean {
    const candidate = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.PropertySignature),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.PropertyDeclaration)
    ].find((property) => {
        if (!property.hasQuestionToken()) {
            return false;
        }
        const typeNode = property.getTypeNode();
        return typeNode != null && !typeNodeAcceptsUndefined(typeNode);
    });
    if (candidate == null) {
        return false;
    }
    const typeNode = candidate.getTypeNodeOrThrow();
    const text = typeNode.getText();
    candidate.setType(
        TYPE_KINDS_THAT_NEED_PARENS_IN_UNION.has(typeNode.getKind()) ? `(${text}) | undefined` : `${text} | undefined`
    );
    return true;
}

function typeNodeAcceptsUndefined(typeNode: TypeNode): boolean {
    if (TYPE_KINDS_THAT_ACCEPT_UNDEFINED.has(typeNode.getKind())) {
        return true;
    }
    if (Node.isParenthesizedTypeNode(typeNode)) {
        return typeNodeAcceptsUndefined(typeNode.getTypeNode());
    }
    if (Node.isUnionTypeNode(typeNode)) {
        return typeNode.getTypeNodes().some((member) => typeNodeAcceptsUndefined(member));
    }
    return false;
}

function rewriteFirstRequiredTypeReference(sourceFile: SourceFile, localTypeNames: Set<string>): boolean {
    const candidate = sourceFile
        .getDescendantsOfKind(SyntaxKind.TypeReference)
        .find((typeReference) => getRequiredLocalTypeName(typeReference, localTypeNames) != null);
    if (candidate == null) {
        return false;
    }
    const typeName = getRequiredLocalTypeName(candidate, localTypeNames);
    if (typeName == null) {
        return false;
    }
    candidate.replaceWithText(`{ [K in keyof ${typeName}]-?: Exclude<${typeName}[K], undefined> }`);
    return true;
}

function getRequiredLocalTypeName(typeReference: TypeReferenceNode, localTypeNames: Set<string>): string | undefined {
    const typeName = typeReference.getTypeName();
    if (!Node.isIdentifier(typeName) || typeName.getText() !== "Required") {
        return undefined;
    }
    const typeArguments = typeReference.getTypeArguments();
    if (typeArguments.length !== 1) {
        return undefined;
    }
    const typeArgument = typeArguments[0];
    if (typeArgument == null || !Node.isTypeReference(typeArgument)) {
        return undefined;
    }
    const argumentName = typeArgument.getTypeName();
    if (!Node.isIdentifier(argumentName)) {
        return undefined;
    }
    const name = argumentName.getText();
    return localTypeNames.has(name) ? name : undefined;
}

function rewriteFirstOptionalSpread(sourceFile: SourceFile): boolean {
    const candidate = sourceFile
        .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
        .find((objectLiteral) => objectLiteralContainsOptionalSpread(objectLiteral));
    if (candidate == null) {
        return false;
    }
    candidate.replaceWithText(objectLiteralToAssignCall(candidate));
    return true;
}

function objectLiteralContainsOptionalSpread(objectLiteral: ObjectLiteralExpression): boolean {
    return objectLiteral
        .getProperties()
        .some((property) => Node.isSpreadAssignment(property) && maySpreadUndefined(property));
}

function maySpreadUndefined(spreadAssignment: SpreadAssignment): boolean {
    const expression = spreadAssignment.getExpression();
    const type = expression.getType();
    const members = type.isUnion() ? type.getUnionTypes() : [type];
    return members.some((member) => typeMayContributeUndefinedProperties(member));
}

function typeMayContributeUndefinedProperties(type: Type): boolean {
    if (type.isUndefined() || type.isNull()) {
        return true;
    }
    for (const symbol of type.getProperties()) {
        const hasOptionalDeclaration = symbol
            .getDeclarations()
            .some(
                (declaration) =>
                    (Node.isPropertySignature(declaration) || Node.isPropertyDeclaration(declaration)) &&
                    declaration.hasQuestionToken()
            );
        if (hasOptionalDeclaration) {
            return true;
        }
        const declaredType = symbol.getDeclaredType();
        if (declaredType.isUnion() && declaredType.getUnionTypes().some((unionMember) => unionMember.isUndefined())) {
            return true;
        }
    }
    return false;
}

// `{ ...a, x: 1, ...b }` becomes `Object.assign({}, a, { x: 1 }, b)`. Spread
// properties in an object literal are evaluated in order with later sources
// winning, which is exactly `Object.assign` semantics.
function objectLiteralToAssignCall(objectLiteral: ObjectLiteralExpression): string {
    const segments: string[] = [];
    let pendingProperties: string[] = [];
    for (const property of objectLiteral.getProperties()) {
        if (Node.isSpreadAssignment(property)) {
            if (pendingProperties.length > 0) {
                segments.push(`{ ${pendingProperties.join(", ")} }`);
                pendingProperties = [];
            }
            segments.push(property.getExpression().getText());
        } else {
            pendingProperties.push(property.getText());
        }
    }
    if (pendingProperties.length > 0) {
        segments.push(`{ ${pendingProperties.join(", ")} }`);
    }
    return `Object.assign({}, ${segments.join(", ")})`;
}

async function enableExactOptionalPropertyTypesInTsConfigs(pathToProject: AbsoluteFilePath): Promise<void> {
    const tsConfigPaths = await glob("tsconfig*.json", { cwd: pathToProject, nodir: true });
    for (const tsConfigPath of tsConfigPaths) {
        const absolutePath = join(pathToProject, RelativeFilePath.of(tsConfigPath));
        const contents = await readFile(absolutePath, "utf-8");
        const parsed: unknown = JSON.parse(contents);
        if (!hasCompilerOptions(parsed)) {
            continue;
        }
        parsed.compilerOptions.exactOptionalPropertyTypes = true;
        await writeFile(absolutePath, JSON.stringify(parsed, undefined, 4));
    }
}

function hasCompilerOptions(value: unknown): value is { compilerOptions: Record<string, unknown> } {
    if (typeof value !== "object" || value == null) {
        return false;
    }
    const compilerOptions = (value as Record<"compilerOptions", unknown>).compilerOptions;
    return typeof compilerOptions === "object" && compilerOptions != null && !Array.isArray(compilerOptions);
}
