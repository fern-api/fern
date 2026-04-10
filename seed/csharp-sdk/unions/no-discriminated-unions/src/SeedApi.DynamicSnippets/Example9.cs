using SeedApi;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.UpdateAsync(
            new ShapeZero {
                Type = ShapeZeroType.Circle,
                Radius = 1.1
            }
        );
    }

}
