using SeedFileDownload;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedFileDownloadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.DownloadFileAsync();
    }

}
