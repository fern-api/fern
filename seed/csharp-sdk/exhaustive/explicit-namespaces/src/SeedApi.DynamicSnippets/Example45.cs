using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Endpoints.Put;

namespace Usage;

public class Example45
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Put.AddAsync(
            new SeedExhaustive.Endpoints.Put.PutRequest{
                Id = "id"
            }
        );
    }

}
