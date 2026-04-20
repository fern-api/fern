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
                Prompt = "You are a helpful assistant",
                Query = "query",
                Stream = false,
                Ending = "$ending",
                Context = "You're super wise",
                MaybeContext = "You're super wise",
                ContainerObject = new ContainerObject {
                    NestedObjects = new List<NestedObjectWithLiterals>(){
                        new NestedObjectWithLiterals {
                            Literal1 = "literal1",
                            Literal2 = "literal2",
                            StrProp = "strProp"
                        },
                        new NestedObjectWithLiterals {
                            Literal1 = "literal1",
                            Literal2 = "literal2",
                            StrProp = "strProp"
                        },
                    }

                }
            }
        );
    }

}
