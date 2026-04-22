using SeedObjectsWithImports;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedObjectsWithImportsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Optional.SendOptionalBodyAsync(
            new Dictionary<string, object?>(){
                ["string"] = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }
                ,
            }
        );
    }

}
