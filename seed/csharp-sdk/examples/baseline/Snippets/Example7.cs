using SeedExamples;
using SeedExamples.File_;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.File.Service.GetFileAsync(
            "filename",
            new GetFileRequest {
                XFileApiVersion = "X-File-API-Version"
            }
        );
    }

}
