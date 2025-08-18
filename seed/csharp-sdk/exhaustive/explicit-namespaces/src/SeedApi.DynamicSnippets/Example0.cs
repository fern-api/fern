using global::System.Threading.Tasks;
using SeedExhaustive;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(
            new List<string>(){
                "string",
                "string",
            }
        );
    }

}
