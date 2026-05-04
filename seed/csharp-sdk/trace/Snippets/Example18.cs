using SeedTrace;

public partial class Examples
{
    public async Task Example18() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Playlist.UpdatePlaylistAsync(
            1,
            "playlistId",
            new UpdatePlaylistRequest {
                Name = "name",
                Problems = new List<string>(){
                    "problems",
                    "problems",
                }

            }
        );
    }

}
