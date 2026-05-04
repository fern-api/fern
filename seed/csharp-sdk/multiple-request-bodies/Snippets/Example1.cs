using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.UploadJsonDocumentAsync(
            new UploadDocumentRequest {
                Author = "author",
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }
                ,
                Title = "title"
            }
        );
    }

}
