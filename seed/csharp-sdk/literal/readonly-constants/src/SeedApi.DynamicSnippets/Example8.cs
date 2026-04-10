using SeedLiteral;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reference.SendAsync(
            new SendRequest {
                Context = new SomeLiteral(),
                Query = "What is the weather today",
                ContainerObject = new ContainerObject {
                    NestedObjects = new List<NestedObjectWithLiterals>(){
                        new NestedObjectWithLiterals {
                            StrProp = "strProp"
                        },
                    }

                }
            }
        );
    }

}
