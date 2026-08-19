using SeedErrors;

public partial class Examples
{
    public async Task Example1() {
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
