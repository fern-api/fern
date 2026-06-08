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
            new GetHeadersPathParamRequest {
                TenantId = "tenant_id",
                HeaderId = "header_id",
                XTenantId = "X-Tenant-Id"
            }
        );
    }

}
