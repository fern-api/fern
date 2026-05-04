using SeedErrorProperty;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedErrorPropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.PropertyBasedError.ThrowErrorAsync();
    }

}
