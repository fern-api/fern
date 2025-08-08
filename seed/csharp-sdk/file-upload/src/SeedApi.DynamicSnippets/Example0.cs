using System.Threading.Tasks;
using SeedFileUpload;

namespace Usage;

public class Example0
{
    public async Task Do()
    {
        var client = new SeedFileUploadClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.SimpleAsync();
    }

}
