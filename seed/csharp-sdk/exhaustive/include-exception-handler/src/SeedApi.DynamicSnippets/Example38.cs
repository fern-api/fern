using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Endpoints;

namespace Usage;

public class Example38
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Put.AddAsync(
            new PutRequest{
                Id = "id"
            }
        );
    }

}
