using SeedPathParameters;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.GetHeadersPathParamBodyAsync(
            "tenant_id",
            "header_id",
            new GetHeadersPathParamBodyRequest {
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
