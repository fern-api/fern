using SeedAliasExtends;

public partial class Examples
{
    public async Task Example0() {
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
