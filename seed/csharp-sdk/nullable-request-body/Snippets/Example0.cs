using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.TestGroup.TestMethodNameAsync(
            new TestMethodNameTestGroupRequest {
                PathParam = "path_param",
                Body = new PlainObject()
            }
        );
    }

}
