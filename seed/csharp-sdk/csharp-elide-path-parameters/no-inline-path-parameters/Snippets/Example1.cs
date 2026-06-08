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
            "header_id",
            new GetHeadersPathParamRequest {
                XTenantId = "X-Tenant-Id"
            }
        );
    }

}
