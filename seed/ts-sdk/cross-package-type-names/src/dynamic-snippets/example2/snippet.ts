import { SeedCrossPackageTypeNamesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedCrossPackageTypeNamesClient({
        environment: "https://api.fern.com",
    });
    
    await client.foo.find({
        optionalString: "optionalString",
        publicProperty: "publicProperty",
        privateProperty: 1,
    });
}
main();
