using SeedClientSideParams;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetUserByIdAsync(
            "userId",
            new GetUserRequest {
                Fields = "fields",
                IncludeFields = true
            }
        );
    }

}
