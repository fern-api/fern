using SeedBytesUpload;
using System.Text;

public partial class Examples
{
    public async Task Example0() {
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
