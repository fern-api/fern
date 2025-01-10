import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.v2.problem.getProblemVersion(SeedTrace.commons.ProblemId("problemId"), 1);
}
main();
