using SeedUndiscriminatedUnions;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetMetadataAsync();
    }

}
