import { execSync } from "child_process";
import { readFileSync } from "fs";

// Matches changelog YAML files: versions.yml and changes/**/*.yml
const CHANGELOG_PATTERN = /(versions\.yml$|changes\/.*\.yml$)/;

// Matches bare `<` followed by a word character or digit, not inside backticks.
// After stripping backtick-wrapped spans, any remaining `<` + word/digit breaks MDX.
const BARE_ANGLE_BRACKET = /<[\w\d/!]/;

function stripBacktickSpans(text: string): string {
    return text.replace(/`[^`]+`/g, "");
}

function checkChangelogMdx(): void {
    const output = execSync("git diff --cached --name-only", {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 10
    });

    const changelogFiles = output
        .split("\n")
        .filter(Boolean)
        .filter((file: string) => CHANGELOG_PATTERN.test(file));

    if (changelogFiles.length === 0) {
        process.stdout.write("No changelog files staged, skipping MDX validation.\n");
        return;
    }

    process.stdout.write(`Checking ${changelogFiles.length} changelog file(s) for bare < characters...\n`);

    const errors: string[] = [];

    for (const file of changelogFiles) {
        let content: string;
        try {
            content = readFileSync(file, "utf8");
        } catch {
            continue;
        }

        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const stripped = stripBacktickSpans(lines[i]!);
            if (BARE_ANGLE_BRACKET.test(stripped)) {
                errors.push(`  ${file}:${i + 1}: ${lines[i]!.trim()}`);
            }
        }
    }

    if (errors.length > 0) {
        const message = [
            "❌ Bare < character(s) found in changelog summaries:",
            ...errors,
            "",
            "Changelog summaries are rendered as MDX. A bare < followed by a letter or",
            "digit is parsed as a JSX tag, which breaks the docs build.",
            "Wrap the expression in backticks, e.g.: Poetry `<2.3.3`"
        ].join("\n");

        process.stderr.write(message + "\n");
        throw new Error("Bare < in changelog");
    }

    process.stdout.write("✅ No bare < characters in changelog summaries\n");
}

checkChangelogMdx();
