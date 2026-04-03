using SeedVariables;

public partial class Examples
{
    public static async Task Example0()
    {
        var client = new SeedVariablesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            "<endpointParam>"
        );
    }

}
