using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;

public partial class Examples
{
    public async Task Example56() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Put.AddAsync(
            new PutRequest {
                Id = "id"
            }
        );
    }

}
