using global::System.Threading.Tasks;
using SeedContentTypes;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.NamedPatchWithMixedAsync(
            "id",
            new NamedMixedPatchRequest{
                AppId = "appId",
                Instructions = "instructions",
                Active = true
            }
        );
    }

}
