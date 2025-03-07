using global::System.Threading.Tasks;
using SeedResponseProperty;
using SeedResponseProperty.Core;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedResponsePropertyClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetMovieAsync(
            "string"
        );
    }

}
