using SeedExtends;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedExtendsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ExtendedInlineRequestBodyAsync(
            new Inlined {
                Name = "name",
                Docs = "docs",
                Unique = "unique"
            }
        );
    }

}
