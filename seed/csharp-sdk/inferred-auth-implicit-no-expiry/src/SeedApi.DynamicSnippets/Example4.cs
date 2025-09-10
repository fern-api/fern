using global::System.Threading.Tasks;
using SeedInferredAuthImplicitNoExpiry;

namespace Usage;

public class Example4
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedInferredAuthImplicitNoExpiryClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
