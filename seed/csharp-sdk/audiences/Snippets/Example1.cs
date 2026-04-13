using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedAudiencesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Foo.FindAsync(
            new FooFindRequest()
        );
    }

}
