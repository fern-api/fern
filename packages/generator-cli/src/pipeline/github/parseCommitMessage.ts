export function parseCommitMessageForPR(commitMessage: string): { prTitle: string; prBody: string } {
    const lines = commitMessage.split("\n");
    const prTitle = lines[0]?.trim() || "SDK Generation";
    const prBody = lines.slice(1).join("\n").trim() || "Automated SDK generation by Fern";
    return { prTitle, prBody };
}
