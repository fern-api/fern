using global::System.Threading.Tasks;
using SeedBytesUpload;
using System.IO;
using System.Text;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedBytesUploadClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UploadAsync(
            new MemoryStream(Encoding.UTF8.GetBytes("Some random text to upload"))
        );
    }

}
