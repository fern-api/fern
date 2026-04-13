using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderAService.FolderAServiceGetDirectThreadAsync(
            new FolderAServiceGetDirectThreadRequest {
                Ids = new List<string>(){
                    "ids",
                }
                ,
                Tags = new List<string>(){
                    "tags",
                }

            }
        );
    }

}
