using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example81() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnIntAsync(
            1
        );
    }

}
