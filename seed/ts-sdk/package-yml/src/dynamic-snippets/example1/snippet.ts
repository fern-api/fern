import { SeedPackageYmlClient } from "../..";

async function main() {
    const client = new SeedPackageYmlClient({
        environment: "https://api.fern.com",
    });
    await client.echo("id", {
        name: "name",
        size: 1,
    });
}
main();
