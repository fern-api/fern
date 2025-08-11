using global::System.Threading.Tasks;
using SeedInferredAuthImplicit;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedInferredAuthImplicitClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
