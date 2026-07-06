using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Widgets.CreateAsync(
            tenant: "tenant",
            version: "version",
            request: new Widget {
                Name = "name"
            }
        );
    }

}
