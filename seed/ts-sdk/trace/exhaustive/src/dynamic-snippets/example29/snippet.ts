import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.v2.problem.getLatestProblem(SeedTrace.commons.ProblemId("problemId"));
}
main();
