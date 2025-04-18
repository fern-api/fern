using global::System.Threading.Tasks;
using SeedExhaustive;

namespace Usage;

public class Example44
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ReqWithHeaders.GetWithCustomHeaderAsync(
            new ReqWithHeaders{
                XTestServiceHeader = "X-TEST-SERVICE-HEADER",
                XTestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
                Body = "string"
            }
        );
    }

}
