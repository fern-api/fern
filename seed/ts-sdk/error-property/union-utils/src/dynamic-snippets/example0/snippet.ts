import { SeedErrorPropertyClient } from "../..";

async function main() {
    const client = new SeedErrorPropertyClient({
        environment: "https://api.fern.com",
    });
    await client.propertyBasedError.throwError();
}
main();
