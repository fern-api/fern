using SeedExhaustive;
using SeedExhaustive.Types.Enum;

public partial class Examples
{
    public static async Task Example10()
    {
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
