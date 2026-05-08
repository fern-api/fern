using SeedApi;
using SeedApi.Endpoints;

public partial class Examples
{
    public async Task Example97() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Put.AddAsync(
            new AddPutRequest {
                Id = "id"
            }
        );
    }

}
