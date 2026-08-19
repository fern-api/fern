using SeedExamples;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Health.Service.CheckAsync(
            "id-2sdx82h"
        );
    }

}
