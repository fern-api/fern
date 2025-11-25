using SeedUnions;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetAsync(
            "id"
        );
    }

}
