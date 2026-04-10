using SeedBytesDownload;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedBytesDownloadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.SimpleAsync();
    }

}
