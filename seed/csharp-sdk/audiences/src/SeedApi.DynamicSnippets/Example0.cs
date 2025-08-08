using System.Threading.Tasks;
using SeedAudiences;

namespace Usage;

public class Example0
{
    public async Task Do()
    {
        var client = new SeedAudiencesClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderA.Service.GetDirectThreadAsync();
    }

}
