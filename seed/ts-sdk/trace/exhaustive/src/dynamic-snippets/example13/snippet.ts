import { SeedTraceClient } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.playlist.getPlaylists(1, {
        limit: 1,
        otherField: "otherField",
        multiLineDocs: "multiLineDocs",
        optionalMultipleField: [
            "optionalMultipleField",
        ],
        multipleField: [
            "multipleField",
        ],
    });
}
main();
