using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.SendAsync(
            new HeadersSendRequest {
                EndpointVersion = HeadersSendRequestXEndpointVersion.Two122024,
                Async = true,
                Query = "query"
            }
        );
    }

}
