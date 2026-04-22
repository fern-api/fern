using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.CallAsync(
            new Request {
                Union = new Dictionary<string, object?>(){
                    ["string"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
