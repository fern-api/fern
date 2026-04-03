using SeedMixedCase;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedMixedCaseClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetResourceAsync(
            "rsc-xyz"
        );
    }

}
