using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example66() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ReqWithHeaders.GetWithCustomHeaderAsync(
            new ReqWithHeaders {
                XTestServiceHeader = "X-TEST-SERVICE-HEADER",
                XTestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
                Body = "string"
            }
        );
    }

}
