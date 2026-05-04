using SeedBytesUpload;
using System.Text;

public partial class Examples
{
    public async Task Example1() {
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
