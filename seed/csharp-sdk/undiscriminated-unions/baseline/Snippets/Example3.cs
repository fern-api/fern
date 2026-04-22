using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.UpdateMetadataAsync(
            new Dictionary<string, object?>(){
                ["string"] = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }
                ,
            }
        );
    }

}
