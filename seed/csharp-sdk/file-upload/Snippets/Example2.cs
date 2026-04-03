using SeedFileUpload;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedFileUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.SimpleAsync();
    }

}
