using SeedPathParameters;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.GetHeadersPathParamAsync(
            "tenant_id",
            "header_id",
            new GetHeadersPathParamRequest {
                XTenantId = "X-Tenant-Id"
            }
        );
    }

}
