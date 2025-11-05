using SeedFileUpload;
using System.Text;

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
            new OptionalArgsRequest {
                ImageFile = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                },
                Request = new Dictionary<string, object>()
            }
        );
    }

}
