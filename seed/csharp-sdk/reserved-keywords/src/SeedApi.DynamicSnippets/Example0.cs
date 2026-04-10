using SeedNurseryApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
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
