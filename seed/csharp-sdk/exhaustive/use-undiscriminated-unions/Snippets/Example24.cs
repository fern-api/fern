using SeedApi;

public partial class Examples
{
    public async Task Example24() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
            new Dictionary<string, TypesMixedType>(){
                ["string"] = 1.1,
            }
        );
    }

}
