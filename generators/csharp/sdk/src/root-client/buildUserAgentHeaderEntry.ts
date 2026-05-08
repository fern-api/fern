import { ast } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Builds the platform-headers `Dictionary` entry for the `User-Agent` header,
 * or `undefined` when no entry should be emitted.
 *
 * - When the IR's `sdkConfig.platformHeaders.userAgent` is set (Fern Definition),
 *   emit the explicit `header`/`value` pair as a plain string literal.
 *   `userAgentFromPackage` is irrelevant in this branch.
 * - When `userAgent` is unset and `userAgentFromPackage` is `true`, fall back to
 *   `$"<NuGetPackageId>/{Version.Current}"` — mirroring the TypeScript
 *   generator's `<npm-package-name>/<version>` fallback. This is the opt-in
 *   parity behavior for SDKs imported from OpenAPI.
 * - When `userAgent` is unset and `userAgentFromPackage` is `false` (default),
 *   return `undefined` so the caller emits no `User-Agent` entry — preserving
 *   the historical C# generator behavior for OpenAPI imports.
 */
export function buildUserAgentHeaderEntry({
    userAgent,
    packageName,
    csharp,
    versionValueAccess,
    userAgentFromPackage
}: {
    userAgent: FernIr.UserAgent | undefined;
    packageName: string;
    csharp: { codeblock: (arg: ast.CodeBlock.Arg) => ast.CodeBlock };
    versionValueAccess: ast.CodeBlock;
    userAgentFromPackage: boolean;
}): ast.Dictionary.MapEntry | undefined {
    if (userAgent != null) {
        return {
            key: csharp.codeblock(`"${userAgent.header}"`),
            value: csharp.codeblock(`"${userAgent.value}"`)
        };
    }
    if (!userAgentFromPackage) {
        return undefined;
    }
    return {
        key: csharp.codeblock('"User-Agent"'),
        value: csharp.codeblock((writer) => {
            writer.write(`$"${packageName}/{`);
            writer.writeNode(versionValueAccess);
            writer.write('}"');
        })
    };
}
