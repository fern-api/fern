using global::System.Threading.Tasks;
using SeedLiteral;
using SeedLiteral.Core;

namespace Usage;

public class Example9
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reference.SendAsync(
            new SendRequest{
                Query = "query",
                ContainerObject = new ContainerObject{
                    NestedObjects = new List<NestedObjectWithLiterals>(){
                        new NestedObjectWithLiterals{
                            StrProp = "strProp"
                        },
                        new NestedObjectWithLiterals{
                            StrProp = "strProp"
                        },
                    }
                }
            }
        );
    }

}
