export function parseCommitMessageForPR(
    commitMessage: string,
    changelogEntry?: string,
    prDescription?: string,
    versionBumpReason?: string
): { prTitle: string; prBody: string } {
    const lines = commitMessage.split("\n");
    const prTitle = lines[0]?.trim() || "SDK Generation";
    const bodyFromCommit = lines.slice(1).join("\n").trim() || "Automated SDK generation by Fern";

    // Prefer prDescription (structured with Before/After code fences) over changelogEntry
    let prBody = prDescription?.trim() || changelogEntry?.trim() || bodyFromCommit;

    // Prepend version bump reason if available
    if (versionBumpReason?.trim()) {
        prBody = `**Version Bump:** ${versionBumpReason.trim()}\n\n${prBody}`;
    }

    return { prTitle, prBody };
}
