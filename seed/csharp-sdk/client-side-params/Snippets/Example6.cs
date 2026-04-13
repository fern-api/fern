using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListusersAsync(
            new ServiceListUsersRequest()
        );
    }

}
