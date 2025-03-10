using global::System.Threading.Tasks;
using SeedTrace;
using SeedTrace.Core;

namespace Usage;

public class Example13
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Playlist.GetPlaylistsAsync(
            1,
            new GetPlaylistsRequest{
                Limit = 1,
                OtherField = "otherField",
                MultiLineDocs = "multiLineDocs",
                OptionalMultipleField = new List<string>(){
                    "optionalMultipleField",
                },
                MultipleField = new List<string>(){
                    "multipleField",
                }
            }
        );
    }

}
