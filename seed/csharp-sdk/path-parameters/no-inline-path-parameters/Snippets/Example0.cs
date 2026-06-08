using SeedPathParameters;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointHeaders.GetEndpointHeadersPathParamAsync(
            "tenant_id",
            "header_id",
            new GetEndpointHeadersPathParamRequest {
                XApiVersion = "X-API-Version"
            }
        );
    }

}
