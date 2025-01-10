import { FiddleClient } from "../..";

async function main(): Promise<void> {
    const client = new FiddleClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.endpoints.primitive.getAndReturnLong(1000000);
}
main();
