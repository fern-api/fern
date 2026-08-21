using SeedCsharpBytesUploadPathParam;
using System.Text;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpBytesUploadPathParamClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UploadWithPathParamAsync(
            objectPath: "<objectPath>",
            request: new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
        );
    }

}
