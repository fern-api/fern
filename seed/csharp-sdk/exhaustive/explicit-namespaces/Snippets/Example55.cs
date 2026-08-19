using SeedExhaustive;
using SeedExhaustive.Endpoints.Put;

public partial class Examples
{
    public async Task Example55() {
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
