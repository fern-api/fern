using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedAudiencesClient(
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
