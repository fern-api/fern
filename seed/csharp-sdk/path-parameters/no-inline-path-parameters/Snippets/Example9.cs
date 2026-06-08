using SeedPathParameters;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserMetadataAsync(
            "tenant_id",
            "user_id",
            1
        );
    }

}
