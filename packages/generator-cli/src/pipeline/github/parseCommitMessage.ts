export function parseCommitMessageForPR(
    commitMessage: string,
    changelogEntry?: string
): { prTitle: string; prBody: string } {
    const lines = commitMessage.split("\n");
    const prTitle = lines[0]?.trim() || "SDK Generation";
    const bodyFromCommit = lines.slice(1).join("\n").trim() || "Automated SDK generation by Fern";
    const prBody = changelogEntry?.trim() || bodyFromCommit;
    return { prTitle, prBody };
}
