using SeedApi;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedApiClient(
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
