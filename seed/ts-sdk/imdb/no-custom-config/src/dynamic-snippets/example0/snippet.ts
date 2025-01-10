import { SeedApiClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.imdb.createMovie({
        title: "title",
        rating: 1.1,
    });
}
main();
