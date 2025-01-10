import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.admin.updateWorkspaceSubmissionStatus(SeedTrace.submission.SubmissionId("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"), SeedTrace.submission.WorkspaceSubmissionStatus.stopped());
}
main();
