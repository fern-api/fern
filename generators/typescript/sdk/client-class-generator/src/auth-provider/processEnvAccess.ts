import { ts } from "ts-morph";

/**
 * Builds the emitted expression for testing whether an environment variable is set.
 *
 * When `guarded`, the read goes through `typeof process !== "undefined"`, which never throws
 * even when `process` is an undeclared global (browsers, Cloudflare Workers, Deno).
 */
export function emitEnvVarPresenceCheck({ envConstant, guarded }: { envConstant: string; guarded: boolean }): string {
    return guarded
        ? `(typeof process !== "undefined" && process.env?.[${envConstant}] != null)`
        : `process.env?.[${envConstant}] != null`;
}

/**
 * Builds the emitted expression for reading an environment variable's value, guarded as
 * described in {@link emitEnvVarPresenceCheck}.
 */
export function emitEnvVarValue({ envConstant, guarded }: { envConstant: string; guarded: boolean }): string {
    return guarded
        ? `(typeof process !== "undefined" ? process.env?.[${envConstant}] : undefined)`
        : `process.env?.[${envConstant}]`;
}

/**
 * AST form of {@link emitEnvVarValue} for a literal environment variable name:
 * `process.env?.["NAME"]`, or the `typeof process` guarded form when `guarded`.
 */
export function createEnvVarValueExpression({ envVar, guarded }: { envVar: string; guarded: boolean }): ts.Expression {
    const read = ts.factory.createElementAccessChain(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("process"),
            ts.factory.createIdentifier("env")
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createStringLiteral(envVar)
    );
    if (!guarded) {
        return read;
    }
    return ts.factory.createParenthesizedExpression(
        ts.factory.createConditionalExpression(
            ts.factory.createBinaryExpression(
                ts.factory.createTypeOfExpression(ts.factory.createIdentifier("process")),
                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                ts.factory.createStringLiteral("undefined")
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            read,
            ts.factory.createToken(ts.SyntaxKind.ColonToken),
            ts.factory.createIdentifier("undefined")
        )
    );
}
