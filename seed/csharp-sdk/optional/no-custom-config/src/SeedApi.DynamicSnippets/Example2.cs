using SeedObjectsWithImports;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedObjectsWithImportsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Optional.SendOptionalNullableWithAllOptionalPropertiesAsync(
            "actionId",
            "id",
            new DeployParams {
                UpdateDraft = true
            }
        );
    }

}
