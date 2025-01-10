import { SeedTraceClient, SeedTrace } from "../..";

async function main(): Promise<void> {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.admin.updateTestSubmissionStatus("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", SeedTrace.submission.TestSubmissionStatus.stopped({}));
}
main();
