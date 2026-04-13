using SeedApi;

namespace Usage;

public class Example23
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetclientAsync(
            new ServiceGetClientRequest {
                ClientId = "clientId",
                Fields = "fields",
                IncludeFields = true
            }
        );
    }

}
