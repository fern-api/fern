using SeedErrors;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FooWithoutEndpointErrorAsync(
            new FooRequest {
                Bar = "bar"
            }
        );
    }

}
