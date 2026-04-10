using SeedApi;
using System.Text;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            new ServicePostRequest {
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
