import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.playlist.getPlaylist(1, SeedTrace.playlist.PlaylistId("playlistId"));
}
main();
