using global::System.Threading.Tasks;
using SeedTrace;

namespace Usage;

public class Example16
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Playlist.DeletePlaylistAsync(
            1,
            "playlist_id"
        );
    }

}
