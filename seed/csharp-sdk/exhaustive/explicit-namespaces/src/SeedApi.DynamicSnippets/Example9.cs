using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Enum;

namespace Usage;

public class Example9
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Enum.GetAndReturnEnumAsync(
            SeedExhaustive.Types.Enum.WeatherReport.Sunny
        );
    }

}
