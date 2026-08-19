using SeedMultiLineDocs;

public partial class Examples
{
    public async Task Example0() {
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
