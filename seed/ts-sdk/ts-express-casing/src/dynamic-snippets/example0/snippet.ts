import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.imdb.createMovie({
        id: "id",
        movieTitle: "movie_title",
        movieRating: 1.1,
    });
}
main();
