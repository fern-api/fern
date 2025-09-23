using SeedInferredAuthExplicit;
using System.Threading.Tasks;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedInferredAuthExplicitClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
