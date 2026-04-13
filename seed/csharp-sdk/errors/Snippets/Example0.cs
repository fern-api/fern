using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FoowithoutendpointerrorAsync(
            new FooRequest {
                Bar = "bar"
            }
        );
    }

}
