using SeedFileUpload;
using System.Text;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedFileUploadClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.WithRefBodyAsync(
            new WithRefBodyRequest {
                ImageFile = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                },
                Request = new MyObject {
                    Foo = "bar"
                }
            }
        );
    }

}
