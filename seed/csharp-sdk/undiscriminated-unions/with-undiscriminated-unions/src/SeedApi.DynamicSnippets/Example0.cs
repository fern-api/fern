using SeedUndiscriminatedUnions;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetAsync(
            "string"
        );
    }

}
