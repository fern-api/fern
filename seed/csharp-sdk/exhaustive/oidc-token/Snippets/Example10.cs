using SeedExhaustive;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Enum.GetAndReturnEnumAsync(
            WeatherReport.Sunny
        );
    }

}
