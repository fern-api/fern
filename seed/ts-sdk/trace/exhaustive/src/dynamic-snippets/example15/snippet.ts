import { SeedTraceClient } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.playlist.updatePlaylist(1, "playlistId", {
        name: "name",
        problems: [
            "problems",
            "problems",
        ],
    });
}
main();
