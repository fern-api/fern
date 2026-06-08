using SeedCsharpElidePathParameters;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedCsharpElidePathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.GetHeadersPathParamBodyAsync(
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
