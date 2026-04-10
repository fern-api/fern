using SeedClientSideParams;

namespace Usage;

public class Example7
{
    public async Task Do() {
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
