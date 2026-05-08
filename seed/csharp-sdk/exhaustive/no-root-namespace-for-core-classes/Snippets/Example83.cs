using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example83() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnLongAsync(
            1000000L
        );
    }

}
