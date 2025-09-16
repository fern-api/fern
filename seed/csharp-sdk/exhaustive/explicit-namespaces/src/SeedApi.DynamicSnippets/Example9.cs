using SeedExhaustive;
using System.Threading.Tasks;
using SeedExhaustive.Types.Enum;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Enum.GetAndReturnEnumAsync(
            WeatherReport.Sunny
        );
    }

}
