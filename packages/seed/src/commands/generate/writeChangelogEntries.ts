import { writeFile } from "fs/promises";
import moment from "moment";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ChangelogEntry } from "@fern-fern/generators-sdk/api/resources/generators";

export function writeChangelogEntries(version: string, entries: ChangelogEntry[] | undefined): string {
    // ## 0.0.1
    // <Note>
    //  - These are upgrade notes
    //  - These are more upgrade notes
    // </Note>
    //
    // `*(feature)*`: This is a feature
    //
    // `*(fix)*`: This is a fix
    //
    // ### Added
    // - This is an added feature
    //
    // ### Changed
    // - This is a changed feature
    //
    // ### Deprecated
    // - This is a deprecated feature
    //
    // ### Removed
    // - This is a removed feature
    //
    // ### Fixed
    // - This is a fixed feature
    //
    let changelogString = `## ${version}\n`;
    const upgradeNotes: string[] = [];
    const summary: string[] = [];
    const added: string[] = [];
    const changed: string[] = [];
    const deprecated: string[] = [];
    const removed: string[] = [];
    const fixed: string[] = [];
    if (entries == null) {
        changelogString += "Nothing new to report!";
    } else {
        entries.forEach((entry) => {
            summary.push(`**\`(${entry.type}):\`** ${entry.summary}`);
            added.push(...(entry.added ?? []));
            changed.push(...(entry.changed ?? []));
            deprecated.push(...(entry.deprecated ?? []));
            removed.push(...(entry.removed ?? []));
            fixed.push(...(entry.fixed ?? []));

            if (entry.upgradeNotes != null) {
                upgradeNotes.push(entry.upgradeNotes);
            }
        });

        if (upgradeNotes.length > 0) {
            changelogString += "<Note>\n";
            upgradeNotes.map(writeAsBullet).join("\n");
            changelogString += "</Note>\n\n";
        }

        changelogString += summary.join("\n\n");

        if (added.length > 0) {
            changelogString += "\n\n### What's new\n";
            changelogString += added.map(writeAsBullet).join("\n");
        }

        if (fixed.length > 0) {
            changelogString += "\n\n### What's been fixed\n";
            changelogString += fixed.map(writeAsBullet).join("\n");
        }

        if (changed.length > 0) {
            changelogString += "\n\n### What's changed\n";
            changelogString += changed.map(writeAsBullet).join("\n");
        }

        if (deprecated.length > 0) {
            changelogString += "\n\n### What's deprecated\n";
            changelogString += deprecated.map(writeAsBullet).join("\n");
        }

        if (removed.length > 0) {
            changelogString += "\n\n### What's been removed\n";
            changelogString += removed.map(writeAsBullet).join("\n");
        }
    }
    return changelogString;
}

function writeAsBullet(entry: string): string {
    return `- ${entry}`;
}

export async function writeChangelogsToFile(outputPath: AbsoluteFilePath, changelogs: Map<Date, Map<string, string>>) {
    for (const [releaseDate, versions] of changelogs.entries()) {
        const changelogPath = join(outputPath, RelativeFilePath.of(`${moment(releaseDate).format("YYYY-MM-DD")}.mdx`));

        let changelogContent = "";
        for (const [_, changelog] of versions.entries()) {
            changelogContent += changelog;
            changelogContent += "\n\n";
        }

        await writeFile(changelogPath, changelogContent);
    }
}
