using SeedVariables;

namespace Usage;

public class Example1
{
    public async Task Do() {
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
