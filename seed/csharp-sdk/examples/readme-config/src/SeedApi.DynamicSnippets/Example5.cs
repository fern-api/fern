using global::System.Threading.Tasks;
using SeedExamples;
using SeedExamples.File;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.File.Service.GetFileAsync(
            "file.txt",
            new GetFileRequest{
                XFileApiVersion = "0.0.2"
            }
        );
    }

}
