using global::System.Threading.Tasks;
using SeedExtends;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExtendsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ExtendedInlineRequestBodyAsync(
            new Inlined{
                Docs = "docs",
                Name = "name",
                Unique = "unique"
            }
        );
    }

}
