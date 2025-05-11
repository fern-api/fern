using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
            new Dictionary<string, ObjectWithRequiredField>(){
                ["string"] = new ObjectWithRequiredField{
                    String = "string"
                },
            }
        );
    }

}
