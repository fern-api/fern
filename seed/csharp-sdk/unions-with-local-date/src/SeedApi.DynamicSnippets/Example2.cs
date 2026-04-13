using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.UpdateAsync(
            new BigUnionZero {
                Value = "value",
                Type = BigUnionZeroType.NormalSweet
            }
        );
    }

}
