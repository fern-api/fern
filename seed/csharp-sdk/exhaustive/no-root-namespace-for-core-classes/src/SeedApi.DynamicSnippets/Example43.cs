using SeedExhaustive;
using System.Threading.Tasks;
using SeedExhaustive.Core;

namespace Usage;

public class Example43
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Urls.WithUnderscoresAsync();
    }

}
