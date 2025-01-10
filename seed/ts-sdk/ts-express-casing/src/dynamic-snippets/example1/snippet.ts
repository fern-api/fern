import { SeedApiClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.imdb.getMovie("movie_id");
}
main();
