using SeedFileUpload;
using System.Text;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedFileUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.JustFileAsync(
            new JustFileRequest {
                File = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                }
            }
        );
    }

}
