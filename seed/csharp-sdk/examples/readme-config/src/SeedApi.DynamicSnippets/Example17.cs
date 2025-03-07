using global::System.Threading.Tasks;
using SeedExamples;
using SeedExamples.Core;

namespace Usage;

public class Example17
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetMetadataAsync(
            new GetMetadataRequest{
                Shallow = true,
                Tag = new List<string?>(){
                    "tag",
                },
                XApiVersion = "X-API-Version"
            }
        );
    }

}
