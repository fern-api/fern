import { SeedExamplesClient } from "../..";

async function main() {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.service.createMovie({
        id: "movie-c06a4ad7",
        prequel: "movie-cv9b914f",
        title: "The Boy and the Heron",
        from: "Hayao Miyazaki",
        rating: 8,
        type: "movie",
        tag: "tag-wf9as23d",
        metadata: {
            "actors": [
                "Christian Bale",
                "Florence Pugh",
                "Willem Dafoe",
            ],
            "releaseDate": "2023-12-08",
            "ratings": {
                rottenTomatoes: 97,
                imdb: 7.6,
            },
        },
        revenue: 1000000,
    });
}
main();
