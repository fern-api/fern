import { SeedEnumClient } from "../..";

async function main() {
    const client = new SeedEnumClient({
        environment: "https://api.fern.com",
    });
    await client.queryParam.send({
        operand: ">",
        maybeOperand: ">",
        operandOrColor: "red",
    });
}
main();
