using SeedAudiences;

public partial class Examples
{
    public static async Task Example1()
    {
        var client = new SeedAudiencesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderD.Service.GetDirectThreadAsync();
    }

}
