using SeedObjectsWithImports;

namespace Usage;

public class Example1
{
    public async Task Do() {
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
