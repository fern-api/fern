using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedSimpleApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetAsync(
            new UserGetRequest {
                Id = "id"
            }
        );
    }

}
