using SeedLiteral;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reference.SendAsync(
            new SendRequest {
                Query = "query",
                Context = new SomeLiteral(),
                MaybeContext = new SomeLiteral(),
                ContainerObject = new ContainerObject {
                    NestedObjects = new List<NestedObjectWithLiterals>(){
                        new NestedObjectWithLiterals {
                            StrProp = "strProp"
                        },
                        new NestedObjectWithLiterals {
                            StrProp = "strProp"
                        },
                    }

                }
            }
        );
    }

}
