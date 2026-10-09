using SeedTrace;

public partial class Examples
{
    public async Task Example13() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Playlist.GetPlaylistsAsync(
            serviceParam: 1,
            request: new GetPlaylistsRequest {
                Limit = 1,
                OtherField = "otherField",
                MultiLineDocs = "multiLineDocs",
                OptionalMultipleField = new List<string>(){
                    "optionalMultipleField",
                }
                ,
                MultipleField = new List<string>(){
                    "multipleField",
                }

            }
        );
    }

}
