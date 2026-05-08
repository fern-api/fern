using SeedApi;
using SeedApi.Endpoints.HttpMethods;

public partial class Examples
{
    public async Task Example37() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.TestDeleteAsync(
            new TestDeleteHttpMethodsRequest {
                Id = "id"
            }
        );
    }

}
