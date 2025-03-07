using global::System.Threading.Tasks;
using SeedApiWideBasePath;
using SeedApiWideBasePath.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiWideBasePathClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            "pathParam",
            "serviceParam",
            "resourceParam",
            1
        );
    }

}
