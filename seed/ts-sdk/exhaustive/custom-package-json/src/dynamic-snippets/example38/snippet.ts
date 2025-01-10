import { FiddleClient, Fiddle.Types.Union.Animal } from "../..";

async function main(): Promise<void> {
    const client = new FiddleClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.endpoints.union.getAndReturnUnion(Fiddle.Types.Union.Animal.dog({
        name: "name",
        likesToWoof: true,
    }));
}
main();
