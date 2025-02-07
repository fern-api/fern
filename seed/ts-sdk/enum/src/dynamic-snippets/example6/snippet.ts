import { SeedEnumClient } from "../..";

async function main() {
    const client = new SeedEnumClient({
        environment: "https://api.fern.com",
    });
    await client.queryParam.sendList({
        operand: [
            ">",
        ],
        maybeOperand: [
            ">",
        ],
        operandOrColor: [
            "red",
        ],
        maybeOperandOrColor: [
            "red",
        ],
    });
}
main();
