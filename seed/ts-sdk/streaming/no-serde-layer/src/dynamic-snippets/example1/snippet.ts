import { SeedStreamingClient } from "../..";

async function main() {
    const client = new SeedStreamingClient({
        environment: "https://api.fern.com",
    });
    await client.dummy.generate({
        stream: false,
        numEvents: 5,
    });
}
main();
