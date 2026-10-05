import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import {
    Node,
    ObjectLiteralExpression,
    Project,
    PropertyDeclaration,
    PropertySignature,
    SourceFile,
    SpreadAssignment,
    SyntaxKind,
    Type,
    TypeNode,
    TypeReferenceNode,
    ts
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

// `keyof T`, `Pick<T, K>` and `T[K]` parse incorrectly without parentheses for
// these type kinds (e.g. `keyof A | B` would mean `(keyof A) | B`).
const TYPE_KINDS_THAT_NEED_PARENS_IN_MAPPED_TYPE = new Set<SyntaxKind>([
    SyntaxKind.UnionType,
    SyntaxKind.IntersectionType,
    SyntaxKind.FunctionType,
    SyntaxKind.ConstructorType,
    SyntaxKind.ConditionalType,
    SyntaxKind.InferType
]);

/**
 * A splice into a source file: replaces the text in `[start, end)` with the
 * result of {@link TextEdit.apply}. `apply` receives a `read` function that
 * resolves a sub-range of the edit to its post-edit text, so rewrites nested
 * inside this range (e.g. a `Required<T>` inside a property type) are composed
 * automatically. Edits are collected in a single AST pass and applied in one
 * composed write per file, which avoids both quadratic re-scans and ts-morph's
 * node invalidation on every mutation.
 */
interface TextEdit {
    /** Inclusive start offset in the original file text. */
    start: number;
    /** Exclusive end offset in the original file text. */
    end: number;
    /** Edits whose ranges are strictly nested inside this edit's range. */
    children: TextEdit[];
    apply: (read: (start: number, end: number) => string) => string;
}

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
 *    `foo: string | undefined` rather than `foo: string`. `Required<T>` is
 *    rewritten to an inline mapped type that removes the optionality-`undefined`
 *    while preserving `undefined` on properties that declared it themselves:
 *    `{ [K in keyof T]-?: {} extends Pick<T, K> ? Exclude<T[K], undefined> : T[K] }`.
 * 2. A spread that may carry `| undefined` properties placed *after* an earlier
 *    source in an object literal (`{ ...defaults, ...options }`) overrides the
 *    earlier values with `| undefined` in the resulting type. Such literals are
 *    rewritten to `Object.assign({}, ...)` segments, whose intersection-typed
 *    result collapses `T & (T | undefined)` back to `T`. Leading spreads
 *    (`{ ...options, x: 1 }`) only forward `| undefined`-admitting optionals,
 *    which the property rewrite already accommodates, so they are left alone.
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

    for (const sourceFile of project.getSourceFiles()) {
        const text = sourceFile.getFullText();
        const edits = collectTextEdits(sourceFile);
        if (edits.length === 0) {
            continue;
        }
        const newText = renderRange(text, 0, text.length, nestEdits(edits));
        await writeFile(sourceFile.getFilePath(), newText);
    }

    await enableExactOptionalPropertyTypesInTsConfigs(pathToProject);
}

function collectTextEdits(sourceFile: SourceFile): TextEdit[] {
    const edits: TextEdit[] = [];
    sourceFile.forEachDescendant((node) => {
        if (Node.isPropertySignature(node) || Node.isPropertyDeclaration(node)) {
            const edit = optionalPropertyEdit(node);
            if (edit != null) {
                edits.push(edit);
            }
        } else if (Node.isTypeReference(node)) {
            const edit = requiredTypeEdit(node);
            if (edit != null) {
                edits.push(edit);
            }
        } else if (Node.isObjectLiteralExpression(node) && objectLiteralNeedsAssignRewrite(node)) {
            edits.push(objectLiteralEdit(node));
        }
    });
    return edits;
}

function optionalPropertyEdit(property: PropertySignature | PropertyDeclaration): TextEdit | undefined {
    if (!property.hasQuestionToken()) {
        return undefined;
    }
    const typeNode = property.getTypeNode();
    if (typeNode == null || typeNodeAcceptsUndefined(typeNode)) {
        return undefined;
    }
    const start = typeNode.getStart();
    const end = typeNode.getEnd();
    const needsParens = TYPE_KINDS_THAT_NEED_PARENS_IN_UNION.has(typeNode.getKind());
    return {
        start,
        end,
        children: [],
        apply: (read) => {
            const inner = read(start, end);
            return needsParens ? `(${inner}) | undefined` : `${inner} | undefined`;
        }
    };
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

function requiredTypeEdit(typeReference: TypeReferenceNode): TextEdit | undefined {
    const typeName = typeReference.getTypeName();
    if (!Node.isIdentifier(typeName) || typeName.getText() !== "Required") {
        return undefined;
    }
    const typeArguments = typeReference.getTypeArguments();
    if (typeArguments.length !== 1) {
        return undefined;
    }
    const typeArgument = typeArguments[0];
    if (typeArgument == null) {
        return undefined;
    }
    const argumentStart = typeArgument.getStart();
    const argumentEnd = typeArgument.getEnd();
    const needsParens = TYPE_KINDS_THAT_NEED_PARENS_IN_MAPPED_TYPE.has(typeArgument.getKind());
    return {
        start: typeReference.getStart(),
        end: typeReference.getEnd(),
        children: [],
        apply: (read) => {
            const argument = needsParens ? `(${read(argumentStart, argumentEnd)})` : read(argumentStart, argumentEnd);
            return `{ [K in keyof ${argument}]-?: {} extends Pick<${argument}, K> ? Exclude<${argument}[K], undefined> : ${argument}[K] }`;
        }
    };
}

// The hazard only exists when a spread that may carry `| undefined` properties
// can overwrite a value already established by an earlier element, as in
// `{ ...defaults, ...options }` or `{ url, ...options }`. A spread in first
// position merely forwards `| undefined`-admitting optionals, and when every
// source is optional-bearing the `Object.assign` intersection cannot collapse
// them anyway, so neither case is worth rewriting.
function objectLiteralNeedsAssignRewrite(objectLiteral: ObjectLiteralExpression): boolean {
    let earlierElementContributesValue = false;
    for (const property of objectLiteral.getProperties()) {
        if (Node.isSpreadAssignment(property)) {
            if (maySpreadUndefined(property)) {
                if (earlierElementContributesValue) {
                    return true;
                }
            } else {
                earlierElementContributesValue = true;
            }
        } else {
            earlierElementContributesValue = true;
        }
    }
    return false;
}

function maySpreadUndefined(spreadAssignment: SpreadAssignment): boolean {
    const expression = spreadAssignment.getExpression();
    const type = expression.getType();
    const members = type.isUnion() ? type.getUnionTypes() : [type];
    return members.some((member) => typeMayContributeUndefinedProperties(member, expression));
}

function typeMayContributeUndefinedProperties(type: Type, location: Node): boolean {
    if (type.isUndefined() || type.isNull()) {
        return true;
    }
    for (const symbol of type.getProperties()) {
        // Check the resolved symbol rather than its declarations so that mapped
        // types are accounted for — e.g. a `Required<T>`-typed spread source has
        // no optional properties even though `T`'s declarations do.
        if ((symbol.getFlags() & ts.SymbolFlags.Optional) !== 0) {
            return true;
        }
        const resolvedType = symbol.getTypeAtLocation(location);
        if (resolvedType.isUnion() && resolvedType.getUnionTypes().some((unionMember) => unionMember.isUndefined())) {
            return true;
        }
    }
    return false;
}

interface ObjectLiteralSegment {
    isSpread: boolean;
    start: number;
    end: number;
}

// `{ ...a, x: 1, ...b }` becomes `Object.assign({}, a, { x: 1 }, b)`. Spread
// properties in an object literal are evaluated in order with later sources
// winning, which is exactly `Object.assign` semantics for the plain data
// objects the generator emits.
function objectLiteralEdit(objectLiteral: ObjectLiteralExpression): TextEdit {
    const segments = collectSegments(objectLiteral);
    return {
        start: objectLiteral.getStart(),
        end: objectLiteral.getEnd(),
        children: [],
        apply: (read) => {
            const parts = segments.map((segment) =>
                segment.isSpread ? read(segment.start, segment.end) : `{ ${read(segment.start, segment.end)} }`
            );
            return `Object.assign({}, ${parts.join(", ")})`;
        }
    };
}

function collectSegments(objectLiteral: ObjectLiteralExpression): ObjectLiteralSegment[] {
    const segments: ObjectLiteralSegment[] = [];
    // Use getPos() (start including leading trivia) for property-run boundaries
    // so comments adjacent to the properties stay inside the wrapped segment.
    let pendingPropsStart: number | undefined;
    const flushPendingProps = (end: number): void => {
        if (pendingPropsStart != null) {
            segments.push({ isSpread: false, start: pendingPropsStart, end });
            pendingPropsStart = undefined;
        }
    };
    for (const property of objectLiteral.getProperties()) {
        if (Node.isSpreadAssignment(property)) {
            flushPendingProps(property.getPos());
            const expression = property.getExpression();
            segments.push({ isSpread: true, start: expression.getStart(), end: expression.getEnd() });
        } else if (pendingPropsStart == null) {
            pendingPropsStart = property.getPos();
        }
    }
    flushPendingProps(objectLiteral.getEnd() - 1);
    return segments;
}

/**
 * Groups the edits into a forest: edits whose ranges nest inside another edit's
 * range become its children. AST-derived ranges never partially overlap — they
 * are either disjoint or nested. The only same-range case is a property whose
 * type is itself `Required<T>`; ties are broken by {@link TextEdit} collection
 * order, where the property edit is emitted first so the `Required` rewrite
 * renders inside its `read`.
 */
function nestEdits(edits: TextEdit[]): TextEdit[] {
    // The sort is stable, so edits with identical ranges keep collection order
    // — the containing edit is always collected first (e.g. a property before
    // the `Required<T>` in its type), which is the nesting order we need.
    const sorted = [...edits].sort((a, b) => a.start - b.start || b.end - a.end);
    const roots: TextEdit[] = [];
    const stack: TextEdit[] = [];
    for (const edit of sorted) {
        while (true) {
            const top = stack[stack.length - 1];
            if (top == null || edit.start < top.end) {
                break;
            }
            stack.pop();
        }
        const parent = stack[stack.length - 1];
        if (parent != null) {
            parent.children.push(edit);
        } else {
            roots.push(edit);
        }
        stack.push(edit);
    }
    return roots;
}

function renderRange(text: string, start: number, end: number, edits: TextEdit[]): string {
    let result = "";
    let cursor = start;
    for (const edit of edits) {
        if (edit.start < cursor || edit.end > end) {
            continue;
        }
        result += text.slice(cursor, edit.start);
        result += edit.apply((readStart, readEnd) =>
            renderRange(
                text,
                readStart,
                readEnd,
                edit.children.filter((child) => child.start >= readStart && child.end <= readEnd)
            )
        );
        cursor = edit.end;
    }
    return result + text.slice(cursor, end);
}

async function enableExactOptionalPropertyTypesInTsConfigs(pathToProject: AbsoluteFilePath): Promise<void> {
    const tsConfigPaths = await glob("tsconfig*.json", { cwd: pathToProject, nodir: true });
    for (const tsConfigPath of tsConfigPaths) {
        const absolutePath = join(pathToProject, RelativeFilePath.of(tsConfigPath));
        const contents = await readFile(absolutePath, "utf-8");
        const parsed: unknown = JSON.parse(contents);
        if (!hasCompilerOptions(parsed) || parsed.compilerOptions.exactOptionalPropertyTypes === true) {
            continue;
        }
        parsed.compilerOptions.exactOptionalPropertyTypes = true;
        const newContents = JSON.stringify(parsed, undefined, 4);
        await writeFile(absolutePath, contents.endsWith("\n") ? `${newContents}\n` : newContents);
    }
}

function hasCompilerOptions(value: unknown): value is { compilerOptions: Record<string, unknown> } {
    if (typeof value !== "object" || value == null) {
        return false;
    }
    const compilerOptions = (value as Record<"compilerOptions", unknown>).compilerOptions;
    return typeof compilerOptions === "object" && compilerOptions != null && !Array.isArray(compilerOptions);
}
