import { ast } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Builds the platform-headers `Dictionary` entry for the `User-Agent` header.
 *
 * - When the IR's `sdkConfig.platformHeaders.userAgent` is set (Fern Definition),
 *   emit the explicit `header`/`value` pair as a plain string literal.
 * - Otherwise (e.g. OpenAPI imports, where the IR generator only sets
 *   `userAgent` when both `version` and `packageName` are non-null), fall back
 *   to `$"<NuGetPackageId>/{Version.Current}"` — mirroring the TypeScript
 *   generator's `<npm-package-name>/<version>` fallback.
 */
export function buildUserAgentHeaderEntry({
    userAgent,
    packageName,
    csharp,
    versionValueAccess
}: {
    userAgent: FernIr.UserAgent | undefined;
    packageName: string;
    csharp: { codeblock: (arg: ast.CodeBlock.Arg) => ast.CodeBlock };
    versionValueAccess: ast.CodeBlock;
}): ast.Dictionary.MapEntry {
    if (userAgent != null) {
        return {
            key: csharp.codeblock(`"${userAgent.header}"`),
            value: csharp.codeblock(`"${userAgent.value}"`)
        };
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
