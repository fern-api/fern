using SeedExamples;
using SeedExamples.File_;

namespace Usage;

public class Example5
{
    public async Task Do() {
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
