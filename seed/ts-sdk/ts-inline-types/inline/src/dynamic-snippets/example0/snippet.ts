import { SeedObjectClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedObjectClient({
        environment: "https://api.fern.com",
    });
    
    await client.getRoot({
        bar: {
            foo: "foo",
        },
        foo: "foo",
    });
}
main();
