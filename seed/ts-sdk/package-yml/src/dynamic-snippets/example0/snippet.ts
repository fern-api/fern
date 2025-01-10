import { SeedPackageYmlClient } from "../..";

async function main() {
    const client = new SeedPackageYmlClient({
        environment: "https://api.fern.com",
    });
    await client.echo("id-ksfd9c1", {
        name: "Hello world!",
        size: 20,
    });
}
main();
