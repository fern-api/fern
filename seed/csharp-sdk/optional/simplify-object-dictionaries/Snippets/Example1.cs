using SeedObjectsWithImports;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedObjectsWithImportsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Optional.SendOptionalTypedBodyAsync(
            new SendOptionalBodyRequest {
                Message = "message"
            }
        );
    }

}
