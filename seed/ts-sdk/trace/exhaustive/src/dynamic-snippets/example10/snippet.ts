import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.homepage.setHomepageProblems([
        SeedTrace.commons.ProblemId("string"),
        SeedTrace.commons.ProblemId("string"),
    ]);
}
main();
