import { SeedStreamingClient } from "../..";

async function main() {
    const client = new SeedStreamingClient({
        environment: "https://api.fern.com",
    });
    await client.dummy.generateStream({
        stream: true,
        numEvents: 1,
    });
}
main();
