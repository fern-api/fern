using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example32() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Enum.GetAndReturnEnumAsync(
            TypesWeatherReport.Sunny
        );
    }

}
