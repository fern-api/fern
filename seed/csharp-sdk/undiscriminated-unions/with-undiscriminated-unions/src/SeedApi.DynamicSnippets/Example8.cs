using SeedApi;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.DuplicatetypesunionAsync(
            "string"
        );
    }

}
