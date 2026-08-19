using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetWithBasePropertiesAsync(
            new NamedMetadata {
                Name = "name",
                Value = new Dictionary<string, object?>(){
                    ["value"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
