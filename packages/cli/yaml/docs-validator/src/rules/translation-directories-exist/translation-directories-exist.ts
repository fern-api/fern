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

                const defaultLocale = (translations.find((t) => t.default === true) ?? translations[0])?.lang;
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

                    const pad = "            ";
                    const indentedTree = expectedTree
                        .split("\n")
                        .map((line) => `${pad}${line}`)
                        .join("\n");

                    violations.push({
                        severity: "error",
                        message:
                            `Missing translation ${missingDirs.length === 1 ? "directory" : "directories"} for ` +
                            `${missingDirs.length === 1 ? "locale" : "locales"}: ${missingDirs.join(", ")}\n\n` +
                            `${pad}Expected directory structure:\n\n${indentedTree}\n\n` +
                            `${pad}Each translation directory should mirror the same page paths used in your\n` +
                            `${pad}docs.yml navigation. For example, if your navigation references\n` +
                            `${pad}"pages/getting-started.mdx", create a translated version at\n` +
                            `${pad}"translations/${missingDirs[0]}/pages/getting-started.mdx".`
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
        const prefix = translationsDirExists ? "│" : " ";
        lines.push(`  ${prefix}   ${connector}── ${missingDirs[i]}/`);
        lines.push(`  ${prefix}   ${isLast ? " " : "│"}   └── pages/`);
        lines.push(`  ${prefix}   ${isLast ? " " : "│"}       └── ... (translated .mdx files)`);
    }
    return lines.join("\n");
}
