using SeedObjectsWithImports;

public partial class Examples
{
    public async Task Example2() {
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
