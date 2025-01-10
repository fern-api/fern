import { SeedExamplesClient } from "../..";

async function main() {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.service.createMovie({
        id: "id",
        prequel: "prequel",
        title: "title",
        from: "from",
        rating: 1.1,
        type: "movie",
        tag: "tag",
        book: "book",
        metadata: {
            metadata: {
                key: "value",
            },
        },
        revenue: 1000000,
    });
}
main();
