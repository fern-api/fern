import { SeedEnumClient } from "../..";

async function main() {
    const client = new SeedEnumClient({
        environment: "https://api.fern.com",
    });
    await client.inlinedRequest.send({
        operand: ">",
        operandOrColor: "red",
    });
}
main();
