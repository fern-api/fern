using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
            new List<SeedExhaustive.Types.Object.ObjectWithRequiredField>(){
                new SeedExhaustive.Types.Object.ObjectWithRequiredField{
                    String = "string"
                },
                new SeedExhaustive.Types.Object.ObjectWithRequiredField{
                    String = "string"
                },
            }
        );
    }

}
