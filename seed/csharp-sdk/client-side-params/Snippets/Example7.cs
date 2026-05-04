using SeedClientSideParams;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.DeleteUserAsync(
            "userId"
        );
    }

}
