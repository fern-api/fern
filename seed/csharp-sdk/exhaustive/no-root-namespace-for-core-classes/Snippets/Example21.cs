using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example21() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
            new Dictionary<string, TypesObjectWithRequiredField>(){
                ["key"] = new TypesObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
