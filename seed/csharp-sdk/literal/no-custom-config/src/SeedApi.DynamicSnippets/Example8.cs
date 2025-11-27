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
                Prompt = "You are a helpful assistant",
                Stream = false,
                Context = "You're super wise",
                Query = "What is the weather today",
                ContainerObject = new ContainerObject {
                    NestedObjects = new List<NestedObjectWithLiterals>(){
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
