using SeedVariables;

public partial class Examples
{
    public async Task Example1() {
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
