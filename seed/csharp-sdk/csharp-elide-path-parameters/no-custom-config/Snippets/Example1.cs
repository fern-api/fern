using SeedCsharpElidePathParameters;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedCsharpElidePathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.GetHeadersPathParamAsync(
            new GetHeadersPathParamRequest {
                HeaderId = "header_id",
                XTenantId = "X-Tenant-Id"
            }
        );
    }

}
