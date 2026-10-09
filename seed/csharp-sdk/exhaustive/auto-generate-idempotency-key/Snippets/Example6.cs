using SeedExhaustive;
using OneOf;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
            new Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>(){
                ["string"] = 1.1,
            }
        );
    }

}
