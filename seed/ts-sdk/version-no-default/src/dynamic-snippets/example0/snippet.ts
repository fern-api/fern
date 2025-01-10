import { SeedVersionClient } from "../..";

async function main() {
    const client = new SeedVersionClient({
        environment: "https://api.fern.com",
    });
    await client.user.getUser("userId");
}
main();
