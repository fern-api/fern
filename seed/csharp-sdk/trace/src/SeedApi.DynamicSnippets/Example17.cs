using SeedTrace;

namespace Usage;

public class Example17
{
    public async Task Do() {
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
