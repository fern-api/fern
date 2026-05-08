using SeedApi;
using SeedApi.InlinedRequests;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlinedRequests.PostWithObjectBodyandResponseAsync(
            new PostWithObjectBodyandResponseInlinedRequestsRequest {
                String = "string",
                Integer = 1,
                NestedObject = new TypesObjectWithOptionalField()
            }
        );
    }

}
