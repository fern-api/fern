import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.upload({
        columns: [
            {
                id: "id",
                values: [
                    1.1,
                ],
            },
        ],
    });
}
main();
