using SeedFileUpload;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedFileUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.OptionalArgsAsync(
            new OptionalArgsRequest()
        );
    }

}
