using SeedUnions;

public partial class Examples
{
    public static async Task Example5()
    {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Types.GetAsync(
            "id"
        );
    }

}
