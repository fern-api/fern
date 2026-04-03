using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.CallAsync(
            new Request {
                Union = new Dictionary<string, object?>(){
                    ["union"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
