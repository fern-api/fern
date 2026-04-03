using SeedApi;

public partial class Examples
{
    public static async Task Example2()
    {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTestAsync(
            new RootObject()
        );
    }

}
