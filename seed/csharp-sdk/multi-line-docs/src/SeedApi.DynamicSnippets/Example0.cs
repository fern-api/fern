using SeedMultiLineDocs;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedMultiLineDocsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserAsync(
            "userId"
        );
    }

}
