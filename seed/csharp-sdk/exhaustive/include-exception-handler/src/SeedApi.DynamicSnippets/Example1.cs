using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
            new List<ObjectWithRequiredField>(){
                new ObjectWithRequiredField{
                    String = "string"
                },
                new ObjectWithRequiredField{
                    String = "string"
                },
            }
        );
    }

}
