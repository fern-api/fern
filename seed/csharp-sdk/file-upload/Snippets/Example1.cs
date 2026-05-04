using SeedFileUpload;
using System.Text;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedFileUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.OptionalArgsAsync(
            new OptionalArgsRequest {
                ImageFile = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                }
            }
        );
    }

}
