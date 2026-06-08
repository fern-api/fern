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
            new GetEndpointHeadersPathParamRequest {
                TenantId = "tenant_id",
                HeaderId = "header_id",
                XApiVersion = "X-API-Version"
            }
        );
    }

}
