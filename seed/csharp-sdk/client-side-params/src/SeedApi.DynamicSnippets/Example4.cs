using SeedClientSideParams;

namespace Usage;

public class Example4
{
    public async Task Do() {
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
