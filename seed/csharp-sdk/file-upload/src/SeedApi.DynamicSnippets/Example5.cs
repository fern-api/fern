using SeedApi;
using System.Text;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.WithformencodedcontainersAsync(
            new ServiceWithFormEncodedContainersRequest {
                File = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                },
                FileList = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                },
                MaybeFile = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                },
                MaybeFileList = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                }
            }
        );
    }

}
