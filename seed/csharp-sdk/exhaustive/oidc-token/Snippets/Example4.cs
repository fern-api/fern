using SeedExhaustive;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
            new Dictionary<string, string>(){
                ["string"] = "string",
            }
        );
    }

}
