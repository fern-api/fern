using SeedPathParameters;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.GetHeadersPathParamBodyAsync(
            new GetHeadersPathParamBodyRequest {
                TenantId = "tenant_id",
                HeaderId = "header_id",
                XTenantId = "X-Tenant-Id",
                Body = new User {
                    Name = "name",
                    Tags = new List<string>(){
                        "tags",
                        "tags",
                    }

                }
            }
        );
    }

}
