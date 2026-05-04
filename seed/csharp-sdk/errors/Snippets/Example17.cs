using SeedErrors;

public partial class Examples
{
    public async Task Example17() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FooWithExamplesAsync(
            new FooRequest {
                Bar = "bar"
            }
        );
    }

}
