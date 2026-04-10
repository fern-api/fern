using SeedAudiences;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedAudiencesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Foo.FindAsync(
            new FindRequest {
                OptionalString = "optionalString",
                PublicProperty = "publicProperty",
                PrivateProperty = 1
            }
        );
    }

}
