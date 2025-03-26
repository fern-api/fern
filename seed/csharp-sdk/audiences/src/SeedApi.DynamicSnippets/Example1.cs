using global::System.Threading.Tasks;
using SeedAudiences;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedAudiencesClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderD.Service.GetDirectThreadAsync();
    }

}
