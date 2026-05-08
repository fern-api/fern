using SeedApi;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ReqWithHeaders.GetWithCustomHeaderAsync(
            new GetWithCustomHeaderReqWithHeadersRequest {
                TestEndpointHeader = "testEndpointHeader",
                Body = "string"
            }
        );
    }

}
