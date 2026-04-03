using SeedTrace;

public partial class Examples
{
    public static async Task Example0()
    {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.TestAsync();
    }

}
