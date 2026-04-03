using SeedApi;

public partial class Examples
{
    public static async Task Example1()
    {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.A.B.FooAsync();
    }

}
