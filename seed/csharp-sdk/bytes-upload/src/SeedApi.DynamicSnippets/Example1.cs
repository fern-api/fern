using SeedBytesUpload;
using System.Text;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedBytesUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UploadWithQueryParamsAsync(
            new UploadWithQueryParamsRequest {
                Model = "nova-2",
                Body = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
            }
        );
    }

}
