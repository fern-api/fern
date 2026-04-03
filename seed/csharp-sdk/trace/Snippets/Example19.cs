using SeedTrace;

public partial class Examples
{
    public async Task Example19() {
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
