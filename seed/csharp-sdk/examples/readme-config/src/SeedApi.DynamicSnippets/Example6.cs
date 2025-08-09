using System.Threading.Tasks;
using SeedExamples;

namespace Usage;

public class Example6
{
    public async Task Do()
    {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.File.Service.GetFileAsync(
            "filename",
            new SeedExamples.File.GetFileRequest
            {
                XFileApiVersion = "X-File-API-Version"
            }
        );
    }

}
