using global::System.Threading.Tasks;
using SeedExamples;
using SeedExamples.Core;

namespace Usage;

public class Example16
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
                Shallow = false,
                Tag = new List<string?>(){
                    "development",
                },
                XApiVersion = "0.0.1"
            }
        );
    }

}
