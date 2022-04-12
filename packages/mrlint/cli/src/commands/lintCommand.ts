import { MonorepoLoggers } from "@mrlint/commons";
import { lintMonorepo } from "@mrlint/lint";
import { parseMonorepo } from "@mrlint/parser";
import rules from "@mrlint/rules";

export async function lintCommand({
    loggers,
    shouldFix,
}: {
    loggers: MonorepoLoggers;
    shouldFix: boolean;
}): Promise<void> {
    const monorepo = await parseMonorepo();

    const result = await lintMonorepo({
        monorepo,
        rules: rules.rules,
        shouldFix,
        loggers,
    });

    if (!result.isSuccess()) {
        process.exit(1);
    }
}
