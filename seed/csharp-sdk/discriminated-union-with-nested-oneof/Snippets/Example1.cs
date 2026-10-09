using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateAstAsync(
            new AstNode(
                new AstNodeLlm {
                    Model = "model",
                    ValueSchema = new Dictionary<string, object?>(){
                        ["value_schema"] = new Dictionary<string, object>()
                        {
                            ["key"] = "value",
                        }
                        ,
                    }
                    ,
                    Prompt = "prompt"
                }
            )
        );
    }

}
