using SeedApi;

public partial class Examples
{
    public async Task Example16() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(
            new List<string>(){
                "string",
                "string",
            }
        );
    }

}
