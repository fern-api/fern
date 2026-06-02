using SeedPathParameters;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserMetadataAsync(
            "user_id",
            1,
            new GetUserMetadataRequest(),
            "tenant_id"
        );
    }

}
