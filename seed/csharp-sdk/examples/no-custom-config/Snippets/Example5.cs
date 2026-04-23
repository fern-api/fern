using SeedExamples;
using SeedExamples.File_;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.File.Service.GetFileAsync(
            "file.txt",
            new GetFileRequest {
                XFileApiVersion = "0.0.2"
            }
        );
    }

}
