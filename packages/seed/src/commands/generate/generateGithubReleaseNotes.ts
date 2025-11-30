import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { ChangelogEntry } from "@fern-fern/generators-sdk/api/resources/generators";

import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases";

const GENERATOR_TO_CHANGELOG_URL: Record<string, string> = {
    "ts-sdk": "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
    "python-sdk": "https://buildwithfern.com/learn/sdks/generators/python/changelog",
    "java-sdk": "https://buildwithfern.com/learn/sdks/generators/java/changelog",
    "go-sdk": "https://buildwithfern.com/learn/sdks/generators/go/changelog",
    "csharp-sdk": "https://buildwithfern.com/learn/sdks/generators/csharp/changelog",
    "ruby-sdk": "https://buildwithfern.com/learn/sdks/generators/ruby/changelog",
    "php-sdk": "https://buildwithfern.com/learn/sdks/generators/php/changelog",
    "swift-sdk": "https://buildwithfern.com/learn/sdks/generators/swift/changelog",
    "rust-sdk": "https://buildwithfern.com/learn/sdks/generators/rust/changelog"
};

const GENERATOR_TO_DISPLAY_NAME: Record<string, string> = {
    "ts-sdk": "TypeScript SDK",
    "python-sdk": "Python SDK",
    "java-sdk": "Java SDK",
    "go-sdk": "Go SDK",
    "csharp-sdk": "C# SDK",
    "ruby-sdk": "Ruby SDK",
    "php-sdk": "PHP SDK",
    "swift-sdk": "Swift SDK",
    "rust-sdk": "Rust SDK"
};

const CLI_CHANGELOG_URL = "https://buildwithfern.com/learn/cli-api-reference/cli-changelog";
const CLI_DISPLAY_NAME = "Fern CLI";

export interface ReleaseNotesResult {
    version: string;
    releaseNotes: string;
}

export async function generateGithubReleaseNotes({
    context,
    generator,
    version
}: {
    context: TaskContext;
    generator: GeneratorWorkspace;
    version: string;
}): Promise<ReleaseNotesResult | undefined> {
    const generatorConfig = generator.workspaceConfig;
    if (generatorConfig.changelogLocation == null) {
        context.logger.error(
            `No changelog location specified for generator ${generator.workspaceName}, unable to generate release notes.`
        );
        return undefined;
    }

    const absolutePathToChangelogLocation = join(
        generator.absolutePathToWorkspace,
        RelativeFilePath.of(generatorConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelogLocation))) {
        context.logger.error(
            `Specified changelog location (${absolutePathToChangelogLocation}) not found, stopping release notes generation.`
        );
        return undefined;
    }

    const generatorId = generator.workspaceName;
    let releaseNotes: string | undefined;

    await parseGeneratorReleasesFile({
        generatorId,
        changelogPath: absolutePathToChangelogLocation,
        context,
        action: async (release) => {
            if (release.version === version) {
                releaseNotes = formatReleaseNotes({
                    generatorId,
                    version: release.version,
                    entries: release.changelogEntry
                });
            }
        }
    });

    if (releaseNotes == null) {
        context.logger.error(`Version ${version} not found in changelog for generator ${generatorId}`);
        return undefined;
    }

    return {
        version,
        releaseNotes
    };
}

function formatReleaseNotes({
    generatorId,
    version,
    entries
}: {
    generatorId: string;
    version: string;
    entries: ChangelogEntry[] | undefined;
}): string {
    const displayName = GENERATOR_TO_DISPLAY_NAME[generatorId] ?? generatorId;
    const changelogUrl = GENERATOR_TO_CHANGELOG_URL[generatorId];

    let releaseNotes = `## ${displayName} ${version}\n\n`;

    if (entries == null || entries.length === 0) {
        releaseNotes += "No changelog entries for this release.\n";
    } else {
        const features: string[] = [];
        const fixes: string[] = [];
        const chores: string[] = [];
        const breaking: string[] = [];

        for (const entry of entries) {
            const summary = entry.summary.trim();
            switch (entry.type) {
                case "feat":
                    features.push(summary);
                    break;
                case "fix":
                    fixes.push(summary);
                    break;
                case "chore":
                    chores.push(summary);
                    break;
                case "break":
                    breaking.push(summary);
                    break;
                default:
                    features.push(summary);
            }
        }

        if (breaking.length > 0) {
            releaseNotes += "### Breaking Changes\n\n";
            for (const item of breaking) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }

        if (features.length > 0) {
            releaseNotes += "### Features\n\n";
            for (const item of features) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }

        if (fixes.length > 0) {
            releaseNotes += "### Bug Fixes\n\n";
            for (const item of fixes) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }

        if (chores.length > 0) {
            releaseNotes += "### Maintenance\n\n";
            for (const item of chores) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }
    }

    if (changelogUrl != null) {
        releaseNotes += `---\n\n`;
        releaseNotes += `[View full changelog](${changelogUrl})\n`;
    }

    return releaseNotes;
}

export async function generateCliGithubReleaseNotes({
    context,
    version,
    changelogPath
}: {
    context: TaskContext;
    version: string;
    changelogPath: AbsoluteFilePath;
}): Promise<ReleaseNotesResult | undefined> {
    if (!(await doesPathExist(changelogPath))) {
        context.logger.error(`CLI changelog file not found at ${changelogPath}`);
        return undefined;
    }

    let releaseNotes: string | undefined;

    await parseGeneratorReleasesFile({
        generatorId: "cli",
        changelogPath,
        context,
        action: async (release) => {
            if (release.version === version) {
                releaseNotes = formatCliReleaseNotes({
                    version: release.version,
                    entries: release.changelogEntry
                });
            }
        }
    });

    if (releaseNotes == null) {
        context.logger.error(`Version ${version} not found in CLI changelog`);
        return undefined;
    }

    return {
        version,
        releaseNotes
    };
}

function formatCliReleaseNotes({
    version,
    entries
}: {
    version: string;
    entries: ChangelogEntry[] | undefined;
}): string {
    let releaseNotes = `## ${CLI_DISPLAY_NAME} ${version}\n\n`;

    if (entries == null || entries.length === 0) {
        releaseNotes += "No changelog entries for this release.\n";
    } else {
        const features: string[] = [];
        const fixes: string[] = [];
        const chores: string[] = [];
        const breaking: string[] = [];

        for (const entry of entries) {
            const summary = entry.summary.trim();
            switch (entry.type) {
                case "feat":
                    features.push(summary);
                    break;
                case "fix":
                    fixes.push(summary);
                    break;
                case "chore":
                    chores.push(summary);
                    break;
                case "break":
                    breaking.push(summary);
                    break;
                default:
                    features.push(summary);
            }
        }

        if (breaking.length > 0) {
            releaseNotes += "### Breaking Changes\n\n";
            for (const item of breaking) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }

        if (features.length > 0) {
            releaseNotes += "### Features\n\n";
            for (const item of features) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }

        if (fixes.length > 0) {
            releaseNotes += "### Bug Fixes\n\n";
            for (const item of fixes) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }

        if (chores.length > 0) {
            releaseNotes += "### Maintenance\n\n";
            for (const item of chores) {
                releaseNotes += `- ${item}\n`;
            }
            releaseNotes += "\n";
        }
    }

    releaseNotes += `---\n\n`;
    releaseNotes += `[View full changelog](${CLI_CHANGELOG_URL})\n`;

    return releaseNotes;
}
