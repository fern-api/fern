using SeedExhaustive;
using SeedExhaustive.Endpoints;

public partial class Examples
{
    public static async Task Example49()
    {
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
