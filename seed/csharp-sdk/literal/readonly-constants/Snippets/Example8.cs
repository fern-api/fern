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
