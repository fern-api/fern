using SeedBytesUpload;
using System.Text;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedBytesUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UploadAsync(
            new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
        );
    }

}
