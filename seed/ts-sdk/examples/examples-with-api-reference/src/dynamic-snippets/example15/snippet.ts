import { SeedExamplesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.service.createMovie({
        id: "id",
        prequel: "prequel",
        title: "title",
        from_: "from",
        rating: 1.1,
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
