using SeedApi;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetuserbyidAsync(
            new ServiceGetUserByIdRequest {
                UserId = "userId"
            }
        );
    }

}
