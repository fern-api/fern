import { SeedAudiencesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedAudiencesClient({
        environment: "https://api.fern.com",
    });
    
    await client.foo.find({
        optionalString: "optionalString",
        publicProperty: "publicProperty",
        privateProperty: 1,
    });
}
main();
