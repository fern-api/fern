import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";

import { Rule, RuleViolation } from "../../Rule.js";

export const TranslationDirectoriesExistRule: Rule = {
    name: "translation-directories-exist",
    create: ({ workspace }) => {
        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];

                const translations = config.translations;
                if (translations == null || translations.length === 0) {
                    return violations;
                }

                const defaultLocale = translations.find((t) => t.default === true)?.lang;
                const translationsDir = join(workspace.absoluteFilePath, RelativeFilePath.of("translations"));
                const translationsDirExists = await doesPathExist(translationsDir);

                const missingDirs: string[] = [];

                for (const translation of translations) {
                    // The default locale's pages live in the top-level pages/ directory
                    if (translation.lang === defaultLocale) {
                        continue;
                    }

                    const langDir = join(translationsDir, RelativeFilePath.of(translation.lang)) as AbsoluteFilePath;

                    if (!(await doesPathExist(langDir))) {
                        missingDirs.push(translation.lang);
                    }
                }

                if (missingDirs.length > 0) {
                    const expectedTree = buildExpectedDirectoryTree({
                        translationsDirExists,
                        missingDirs,
                        fernFolderPath: workspace.absoluteFilePath
                    });

                    violations.push({
                        severity: "error",
                        message:
                            `Missing translation ${missingDirs.length === 1 ? "directory" : "directories"} for ` +
                            `${missingDirs.length === 1 ? "locale" : "locales"}: ${missingDirs.join(", ")}\n\n` +
                            `Expected directory structure:\n\n${expectedTree}\n\n` +
                            `Each translation directory should mirror the same page paths used in your docs.yml navigation.\n` +
                            `For example, if your navigation references "pages/getting-started.mdx", create a\n` +
                            `translated version at "translations/${missingDirs[0]}/pages/getting-started.mdx".`
                    });
                }

                return violations;
            }
        };
    }
};

function buildExpectedDirectoryTree({
    translationsDirExists,
    missingDirs,
    fernFolderPath
}: {
    translationsDirExists: boolean;
    missingDirs: string[];
    fernFolderPath: AbsoluteFilePath;
}): string {
    const fernDirName = fernFolderPath.split("/").pop() ?? "fern";
    const lines: string[] = [];
    lines.push(`  ${fernDirName}/`);
    lines.push(`  ${translationsDirExists ? "├" : "└"}── translations/`);
    for (let i = 0; i < missingDirs.length; i++) {
        const isLast = i === missingDirs.length - 1;
        const connector = isLast ? "└" : "├";
        lines.push(`  │   ${connector}── ${missingDirs[i]}/`);
        lines.push(`  │   ${isLast ? " " : "│"}   └── pages/`);
        lines.push(`  │   ${isLast ? " " : "│"}       └── ... (translated .mdx files)`);
    }
    return lines.join("\n");
}
