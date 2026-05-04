using SeedNurseryApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedNurseryApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Package.TestAsync(
            new TestRequest {
                For = "for"
            }
        );
    }

}
