export function parseCommitMessageForPR(
    commitMessage: string,
    changelogEntry?: string,
    prDescription?: string,
    versionBumpReason?: string,
    previousVersion?: string,
    newVersion?: string,
    versionBump?: string,
    changelogUrl?: string
): { prTitle: string; prBody: string } {
    const lines = commitMessage.split("\n");
    const prTitle = lines[0]?.trim() || "SDK Generation";
    const bodyFromCommit = lines.slice(1).join("\n").trim() || "Automated SDK generation by Fern";

    // Prefer prDescription (structured with Before/After code fences) over changelogEntry
    let prBody = prDescription?.trim() || changelogEntry?.trim() || bodyFromCommit;

    // Prepend version header: "version X → Y" with emoji for breaking changes
    const isBreaking = versionBump === "MAJOR";
    if (previousVersion?.trim() && newVersion?.trim()) {
        const emoji = isBreaking ? "\u26A0\uFE0F " : "";
        const header = `## ${emoji}${previousVersion.trim()} \u2192 ${newVersion.trim()}`;
        if (isBreaking && versionBumpReason?.trim()) {
            prBody = `${header}\n\n**Breaking:** ${versionBumpReason.trim()}\n\n${prBody}`;
        } else {
            prBody = `${header}\n\n${prBody}`;
        }
    } else if (isBreaking && versionBumpReason?.trim()) {
        // No version info available but still breaking — show reason
        prBody = `\u26A0\uFE0F **Breaking:** ${versionBumpReason.trim()}\n\n${prBody}`;
    }

    // Append link to full changelog when available
    if (changelogUrl?.trim()) {
        prBody += `\n\n---\n\n[See full changelog](${changelogUrl.trim()})`;
    }

    return { prTitle, prBody };
}
