using SeedErrors;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FooAsync(
            new FooRequest {
                Bar = "bar"
            }
        );
    }

}
