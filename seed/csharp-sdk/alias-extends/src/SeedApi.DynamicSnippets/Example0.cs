using global::System.Threading.Tasks;
using SeedAliasExtends;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedAliasExtendsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ExtendedInlineRequestBodyAsync(
            new InlinedChildRequest{
                Parent = "parent",
                Child = "child"
            }
        );
    }

}
