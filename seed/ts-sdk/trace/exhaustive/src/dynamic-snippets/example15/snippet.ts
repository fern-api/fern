import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.playlist.updatePlaylist(1, SeedTrace.playlist.PlaylistId("playlistId"), {
        name: "name",
        problems: [
            SeedTrace.commons.ProblemId("problems"),
            SeedTrace.commons.ProblemId("problems"),
        ],
    });
}
main();
