using SeedObject;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedObjectClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetRootAsync(
            new PostRootRequest {
                Bar = new RequestTypeInlineType1 {
                    Foo = "foo"
                },
                Foo = "foo"
            }
        );
    }

}
