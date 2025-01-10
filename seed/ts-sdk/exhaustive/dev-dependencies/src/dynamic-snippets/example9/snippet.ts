import { FiddleClient } from "../..";

async function main() {
    const client = new FiddleClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.endpoints.enum.getAndReturnEnum("SUNNY");
}
main();
