import { SeedUnionsClient } from "../..";

async function main() {
    const client = new SeedUnionsClient({
        environment: "https://api.fern.com",
    });
    await client.union.update({
        type: "circle",
        radius: 1.1,
    });
}
main();
