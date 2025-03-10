using global::System.Threading.Tasks;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.File;

namespace Usage;

public class Example6
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.File.Service.GetFileAsync(
            "filename",
            new GetFileRequest{
                XFileApiVersion = "X-File-API-Version"
            }
        );
    }

}
