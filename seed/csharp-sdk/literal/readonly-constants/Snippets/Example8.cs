using SeedLiteral;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reference.SendAsync(
            new SendRequest {
                Query = "What is the weather today",
                Context = new SomeLiteral(),
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
