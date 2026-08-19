using SeedAlias;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedAliasClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetAsync(
            "typeId"
        );
    }

}
