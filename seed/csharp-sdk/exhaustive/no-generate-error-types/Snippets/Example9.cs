using SeedApi;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ReqWithHeaders.GetWithCustomHeaderAsync(
            new GetWithCustomHeaderReqWithHeadersRequest {
                TestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
                Body = "string"
            }
        );
    }

}
