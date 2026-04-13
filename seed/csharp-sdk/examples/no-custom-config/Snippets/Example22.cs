using SeedApi;

public partial class Examples
{
    public async Task Example22() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTypeAsync(
            BasicType.Primitive
        );
    }

}
