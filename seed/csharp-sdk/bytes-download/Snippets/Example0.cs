using SeedBytesDownload;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBytesDownloadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.SimpleAsync();
    }

}
