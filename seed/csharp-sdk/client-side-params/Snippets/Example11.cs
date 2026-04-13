using SeedApi;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetuserbyidAsync(
            new ServiceGetUserByIdRequest {
                UserId = "userId",
                Fields = "fields",
                IncludeFields = true
            }
        );
    }

}
