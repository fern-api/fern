import { FiddleClient, Fiddle } from "../..";

async function main(): Promise<void> {
    const client = new FiddleClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.endpoints.union.getAndReturnUnion(Fiddle.types.union.Animal.dog({
        name: "name",
        likesToWoof: true,
    }));
}
main();
