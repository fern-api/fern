using SeedAliasExtends;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedAliasExtendsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ExtendedInlineRequestBodyAsync(
            new InlinedChildRequest {
                Parent = "parent",
                Child = "child"
            }
        );
    }

}
