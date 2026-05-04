using SeedTrace;

public partial class Examples
{
    public async Task Example16() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Playlist.GetPlaylistAsync(
            1,
            "playlistId"
        );
    }

}
