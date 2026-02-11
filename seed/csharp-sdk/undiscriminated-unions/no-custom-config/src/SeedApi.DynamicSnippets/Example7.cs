using SeedUndiscriminatedUnions;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.DuplicateTypesUnionAsync(
            "string"
        );
    }

}
