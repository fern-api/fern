using SeedApi;

public partial class Examples
{
    public static async Task Example4()
    {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Folder.Service.EndpointAsync();
    }

}
