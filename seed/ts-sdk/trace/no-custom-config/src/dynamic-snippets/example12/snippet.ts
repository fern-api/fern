import { SeedTraceClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.playlist.createPlaylist(1, {
        datetime: new Date("2024-01-15T09:30:00Z"),
        optionalDatetime: new Date("2024-01-15T09:30:00Z"),
        body: {
            name: "name",
            problems: [
                "problems",
                "problems",
            ],
        },
    });
}
main();
