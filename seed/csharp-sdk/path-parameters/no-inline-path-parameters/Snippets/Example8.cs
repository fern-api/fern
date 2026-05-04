using SeedPathParameters;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserSpecificsAsync(
            "tenant_id",
            "user_id",
            1,
            "thought",
            new GetUserSpecificsRequest()
        );
    }

}
