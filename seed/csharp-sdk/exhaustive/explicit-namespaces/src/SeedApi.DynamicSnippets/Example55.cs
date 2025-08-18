using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.ReqWithHeaders;

namespace Usage;

public class Example55
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ReqWithHeaders.GetWithCustomHeaderAsync(
            new SeedExhaustive.ReqWithHeaders.ReqWithHeaders{
                XTestServiceHeader = "X-TEST-SERVICE-HEADER",
                XTestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
                Body = "string"
            }
        );
    }

}
