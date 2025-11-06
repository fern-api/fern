using SeedExamples;
using SeedExamples.File_;

namespace Usage;

public class Example6
{
    public async Task Do() {
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
