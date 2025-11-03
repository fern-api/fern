using SeedTrace;

namespace Usage;

public class Example19
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Playlist.DeletePlaylistAsync(
            1,
            "playlist_id"
        );
    }

}
