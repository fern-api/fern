using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetFooAsync(
            new GetFooRequest {
                OptionalBaz = "optional_baz",
                OptionalNullableBaz = "optional_nullable_baz",
                RequiredBaz = "required_baz",
                RequiredNullableBaz = "required_nullable_baz"
            }
        );
    }

}
