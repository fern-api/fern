using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetFooAsync(
            new GetFooRequest {
                RequiredBaz = "required_baz",
                RequiredNullableBaz = "required_nullable_baz"
            }
        );
    }

}
