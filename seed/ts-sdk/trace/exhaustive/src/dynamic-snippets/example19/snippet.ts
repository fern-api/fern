import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.problem.deleteProblem(SeedTrace.commons.ProblemId("problemId"));
}
main();
